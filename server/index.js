const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache events for 15 minutes to reduce API calls
const cache = new NodeCache({ stdTTL: 900 });

// Set up axios with cookie support for session management
const cookieJar = new CookieJar();
const axiosInstance = wrapper(axios.create({
  jar: cookieJar,
  withCredentials: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}));

// Cache for authentication session
let authSession = null;
const AUTH_CACHE_TTL = 3600000; // 1 hour in milliseconds
let lastAuthTime = 0;

app.use(cors());
app.use(express.json());

// Known USF campus locations with coordinates
const USF_LOCATIONS = {
  // Student Centers & Main Buildings
  'marshall student center': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center' },
  'msc': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center' },
  'student center': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center' },
  'msc 2709': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center Room 2709' },
  'msc 3705': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center Room 3705' },
  'room 2709': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center Room 2709' },
  'room 3705': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center Room 3705' },

  // Academic Buildings
  'cooper hall': { lat: 28.0640, lng: -82.4180, name: 'Cooper Hall' },
  'library': { lat: 28.0670, lng: -82.4150, name: 'USF Library' },
  'criser hall': { lat: 28.0645, lng: -82.4165, name: 'Criser Hall' },
  'engineering': { lat: 28.0660, lng: -82.4130, name: 'Engineering Building' },
  'ene': { lat: 28.0660, lng: -82.4130, name: 'Engineering Building' },
  'business': { lat: 28.058329, lng: -82.409798, name: 'Muma College of Business' },
  'bsn': { lat: 28.058329, lng: -82.409798, name: 'Muma College of Business' },
  'muma': { lat: 28.058329, lng: -82.409798, name: 'Muma College of Business' },
  'physics': { lat: 28.0655, lng: -82.4145, name: 'Physics Building' },
  'phy': { lat: 28.0655, lng: -82.4145, name: 'Physics Building' },
  'chemistry': { lat: 28.0662, lng: -82.4152, name: 'Chemistry Building' },
  'chm': { lat: 28.0662, lng: -82.4152, name: 'Chemistry Building' },
  'science center': { lat: 28.0668, lng: -82.4155, name: 'Science Center' },
  'isv': { lat: 28.0668, lng: -82.4155, name: 'Interdisciplinary Science Building' },
  'arts': { lat: 28.0642, lng: -82.4202, name: 'Contemporary Art Museum' },
  'cam': { lat: 28.0642, lng: -82.4202, name: 'Contemporary Art Museum' },
  'contemporary art museum': { lat: 28.0642, lng: -82.4202, name: 'USF Contemporary Art Museum' },
  'usf contemporary art museum': { lat: 28.0642, lng: -82.4202, name: 'USF Contemporary Art Museum' },
  
  // Theatre locations
  'theatre': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre' },
  'theater': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre' },
  'usf theatre': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre' },
  'usf theater': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre' },
  'theatre 1': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre 1' },
  'theatre 2': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre 2' },
  'theater 1': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre 1' },
  'theater 2': { lat: 28.0645, lng: -82.4200, name: 'USF Theatre 2' },

  // Recreation & Sports
  'recreation center': { lat: 28.0632, lng: -82.4140, name: 'Campus Recreation Center' },
  'rec center': { lat: 28.0632, lng: -82.4140, name: 'Campus Recreation Center' },
  'yuengling center': { lat: 28.0620, lng: -82.4098, name: 'Yuengling Center' },
  'sun dome': { lat: 28.0620, lng: -82.4098, name: 'Yuengling Center (Sun Dome)' },

  // Residence Halls
  'juniper': { lat: 28.0605, lng: -82.4193, name: 'Juniper-Poplar Hall' },
  'poplar': { lat: 28.0605, lng: -82.4193, name: 'Juniper-Poplar Hall' },
  'jpop': { lat: 28.0605, lng: -82.4193, name: 'Juniper-Poplar Hall' },
  'the village': { lat: 28.0575, lng: -82.4165, name: 'The Village' },
  'beta hall': { lat: 28.0595, lng: -82.4150, name: 'Beta Hall' },
  'alpha hall': { lat: 28.0598, lng: -82.4155, name: 'Alpha Hall' },
  'delta hall': { lat: 28.0592, lng: -82.4145, name: 'Delta Hall' },
  'epsilon hall': { lat: 28.0590, lng: -82.4160, name: 'Epsilon Hall' },
  'theta hall': { lat: 28.0588, lng: -82.4152, name: 'Theta Hall' },
  'castor hall': { lat: 28.0612, lng: -82.4162, name: 'Castor Hall' },
  'maple hall': { lat: 28.0608, lng: -82.4188, name: 'Maple Hall' },
  'magnolia hall': { lat: 28.0602, lng: -82.4185, name: 'Magnolia Hall' },

  // Dining
  'dining': { lat: 28.0648, lng: -82.4172, name: 'Dining' },
  'argos': { lat: 28.0648, lng: -82.4172, name: 'Argos Exchange' },
  'fresh food': { lat: 28.0608, lng: -82.4168, name: 'Fresh Food Company' },

  // Other Campus Locations
  'wellness center': { lat: 28.0638, lng: -82.4188, name: 'Student Health & Wellness Center' },
  'parking': { lat: 28.0655, lng: -82.4120, name: 'Campus Parking' },
  'bookstore': { lat: 28.0652, lng: -82.4192, name: 'USF Bookstore' },
  'tampa campus': { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' },
  'usf tampa': { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' },
  'usf': { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' },
  
  // Additional common locations
  'gibbons alumni center': { lat: 28.0625, lng: -82.4145, name: 'Gibbons Alumni Center' },
  'patel center': { lat: 28.0645, lng: -82.4120, name: 'Patel Center for Global Solutions' },
  'research park': { lat: 28.0700, lng: -82.4100, name: 'USF Research Park' },
  'athletic facilities': { lat: 28.0620, lng: -82.4098, name: 'Athletic Facilities' },
  
  // Student Services Building
  'student services building': { lat: 28.0640, lng: -82.4165, name: 'Student Services Building (SVC)' },
  'svc': { lat: 28.0640, lng: -82.4165, name: 'Student Services Building (SVC)' },
  
  // Engineering Building rooms (ENB = Engineering Building)
  'enb': { lat: 28.0660, lng: -82.4130, name: 'Engineering Building' },
  'engineering building': { lat: 28.0660, lng: -82.4130, name: 'Engineering Building' },
  
  // The Loft (common student space, likely in MSC or nearby)
  'the loft': { lat: 28.063934, lng: -82.4134536, name: 'The Loft' },
  'loft': { lat: 28.063934, lng: -82.4134536, name: 'The Loft' },
  
  // Off-campus locations
  'mcdonald park': { lat: 28.0550, lng: -82.4500, name: 'McDonald Park' },
  'mcdonald': { lat: 28.0550, lng: -82.4500, name: 'McDonald Park' },
  'mcdugald park': { lat: 28.0550, lng: -82.4500, name: 'McDugald Park' },
  'lake park archery range': { lat: 28.1515, lng: -82.4615, name: 'Lake Park Archery Range' },
  'academy sim racing': { lat: 28.0500, lng: -82.4000, name: 'Academy Sim Racing' }
};

// Geocode location string to coordinates
function geocodeLocation(locationString) {
  if (!locationString || locationString.trim() === '') {
    return { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' }; // Default to campus center
  }
  
  // Check for restricted messages
  const locationLower = locationString.toLowerCase();
  if (locationLower.includes('sign in') || 
      locationLower.includes('private location') ||
      locationLower.includes('sign in to display')) {
    return { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' }; // Default to campus center
  }
  
  // Handle online/virtual events - don't show on map
  if (locationLower.includes('online') || 
      locationLower.includes('virtual') ||
      locationLower.includes('teams meeting') ||
      locationLower.includes('zoom') ||
      locationLower === 'online event') {
    return null; // Return null to indicate this shouldn't be shown on map
  }

  // Check for room numbers in buildings (e.g., "ENB 216", "MSC 2709", "Room 2709- Marshall Student Center")
  // Try pattern: "Room XXXX- Building" or "Building XXXX" or "BuildingCode XXXX"
  let roomMatch = locationLower.match(/room\s+(\d+)[\s-]+(.+)/);
  if (roomMatch) {
    const roomNumber = roomMatch[1];
    const buildingName = roomMatch[2].trim();
    
    // Try to match the building name
    for (const [key, coords] of Object.entries(USF_LOCATIONS)) {
      if (buildingName.includes(key) || key.includes(buildingName.substring(0, Math.min(10, buildingName.length)))) {
        return { ...coords, name: `${coords.name} Room ${roomNumber}` };
      }
    }
  }
  
  // Try pattern: "BuildingCode XXXX" (e.g., "MSC 2709", "ENB 216")
  roomMatch = locationLower.match(/(\w+)\s+(\d+)/);
  if (roomMatch) {
    const buildingCode = roomMatch[1];
    const roomNumber = roomMatch[2];
    
    // Map building codes to locations
    const buildingCodeMap = {
      'enb': 'engineering',
      'ene': 'engineering',
      'cooper': 'cooper hall',
      'criser': 'criser hall',
      'svc': 'student services building',
      'msc': 'marshall student center',
      'library': 'library'
    };
    
    if (buildingCodeMap[buildingCode]) {
      const buildingKey = buildingCodeMap[buildingCode];
      for (const [key, coords] of Object.entries(USF_LOCATIONS)) {
        if (key.includes(buildingKey)) {
          return { ...coords, name: `${coords.name} Room ${roomNumber}` };
        }
      }
    }
  }
  
  // Check for addresses (e.g., "17302 N Dale Mabry Hwy, Lutz, FL 33548")
  const addressMatch = locationString.match(/(\d+)\s+([^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d+)/);
  if (addressMatch) {
    // For now, try to match known off-campus locations by name
    // In the future, could use a geocoding API here
    const addressName = addressMatch[2].toLowerCase();
    if (addressName.includes('lake park') || addressName.includes('archery')) {
      return { lat: 28.1515, lng: -82.4615, name: 'Lake Park Archery Range' };
    }
  }
  
  // Check known locations - try exact match first, then substring match
  // Also normalize the location string (remove extra spaces, punctuation)
  const normalizedLocation = locationLower.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Try exact match first
  if (USF_LOCATIONS[normalizedLocation]) {
    return USF_LOCATIONS[normalizedLocation];
  }
  
  // Try substring matches - check if any key is contained in the location string
  for (const [key, coords] of Object.entries(USF_LOCATIONS)) {
    // Check if key is in location (e.g., "theatre" matches "usf theatre 2")
    if (locationLower.includes(key) || normalizedLocation.includes(key)) {
      // For room/space numbers, check if we need to append info
      const numberMatch = locationString.match(/\s+(\d+)$/);
      if (numberMatch && (key.includes('theatre') || key.includes('theater') || key.includes('hall') || key.includes('building'))) {
        return { ...coords, name: `${coords.name} ${numberMatch[1]}` };
      }
      return coords;
    }
    // Also try reverse - check if location is in key (for partial matches)
    if (key.includes(normalizedLocation) || key.includes(locationLower.substring(0, Math.min(15, locationLower.length)))) {
      return coords;
    }
  }
  
  // Check for partial matches by splitting location into words
  const locationWords = normalizedLocation.split(/\s+/);
  for (const word of locationWords) {
    if (word.length > 3) { // Only check words longer than 3 characters
      for (const [key, coords] of Object.entries(USF_LOCATIONS)) {
        if (key.includes(word) || word.includes(key)) {
          return coords;
        }
      }
    }
  }

  // Log unmatched locations so we can add them to the dictionary
  // Only log first few to avoid spam
  if (typeof geocodeLocation._unmatchedLogCount === 'undefined') {
    geocodeLocation._unmatchedLogCount = 0;
    geocodeLocation._unmatchedLocations = new Set();
  }
  
  // Only log if we haven't seen this location before
  if (!geocodeLocation._unmatchedLocations.has(locationString) && geocodeLocation._unmatchedLogCount < 15) {
    console.log(`  ⚠ Unmatched location: "${locationString}" - defaulting to campus center`);
    geocodeLocation._unmatchedLocations.add(locationString);
    geocodeLocation._unmatchedLogCount++;
  }

  // If no match, return campus center (but keep the original location name)
  // This way events with actual locations still show their location name even if we can't geocode it
  return { lat: 28.0650, lng: -82.4170, name: locationString };
}

// Authenticate with BullsConnect
async function authenticateBullsConnect() {
  const username = process.env.BULLS_CONNECT_USER;
  const password = process.env.BULLS_CONNECT_PW;

  if (!username || !password) {
    console.warn('BullsConnect credentials not found in .env file. Proceeding without authentication.');
    return false;
  }

  console.log(`Attempting authentication for user: ${username.substring(0, 3)}***`);

  // Check if we have a recent valid session
  const now = Date.now();
  if (authSession && (now - lastAuthTime) < AUTH_CACHE_TTL) {
    console.log('Using cached authentication session');
    return true;
  }

  try {
    console.log('Authenticating with BullsConnect...');
    
    // BullsConnect likely uses Engage/Anthology platform which typically has SSO
    // Try the main site first to get session cookies and understand the auth flow
    try {
      const homePageResponse = await axiosInstance.get('https://bullsconnect.usf.edu/', {
        maxRedirects: 5
      });
      const homeCookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
      console.log(`Initial session established - ${homeCookies.length} cookies from homepage`);
      
      // Check if we're already logged in (redirected away from login)
      const finalUrl = homePageResponse.request?.res?.responseUrl || homePageResponse.config?.url;
      if (finalUrl && !finalUrl.includes('/login')) {
        console.log('Already authenticated? Final URL:', finalUrl.substring(0, 80));
      }
    } catch (err) {
      console.log('Initial session request failed:', err.message);
    }

    // Try the mobile API login endpoint (common pattern for mobile APIs)
    let loginSuccess = false;
    
    try {
      // Try mobile API authentication endpoint
      const mobileLoginResponse = await axiosInstance.post(
        'https://bullsconnect.usf.edu/mobile_ws/v17/login',
        {
          username: username,
          password: password,
          email: username
        },
        {
          maxRedirects: 0,
          validateStatus: (status) => status < 500
        }
      );

      const cookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
      const cookieCount = cookies ? cookies.length : 0;
      console.log(`Mobile API login attempt: Status ${mobileLoginResponse.status}, Cookies: ${cookieCount}`);
      if (cookieCount > 0 || mobileLoginResponse.status === 200) {
        console.log('Successfully authenticated via mobile API');
        loginSuccess = true;
        authSession = true;
        lastAuthTime = now;
      }
    } catch (err) {
      console.log('Mobile API login failed:', err.response?.status || err.message);
    }

    // If mobile API login didn't work, try web-based login with HTML parsing
    if (!loginSuccess) {
      try {
        // Get login page to establish session and parse form
        const loginPageResponse = await axiosInstance.get('https://bullsconnect.usf.edu/login', {
          maxRedirects: 5
        });
        console.log(`Login page status: ${loginPageResponse.status}`);
        
        // Parse HTML to find form action and CSRF tokens
        const $ = cheerio.load(loginPageResponse.data);
        const form = $('form').first();
        const formAction = form.attr('action') || '/login';
        const loginUrl = formAction.startsWith('http') ? formAction : `https://bullsconnect.usf.edu${formAction}`;
        
        // Extract all hidden inputs (often CSRF tokens)
        const hiddenInputs = {};
        form.find('input[type="hidden"]').each((i, elem) => {
          const name = $(elem).attr('name');
          const value = $(elem).attr('value');
          if (name && value) {
            hiddenInputs[name] = value;
          }
        });
        
        // Find username and password field names
        const usernameField = form.find('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"], input[name*="email"]').first().attr('name') || 'username';
        const passwordField = form.find('input[type="password"]').first().attr('name') || 'password';
        
        console.log(`Found form action: ${loginUrl}, username field: ${usernameField}, password field: ${passwordField}`);
        if (Object.keys(hiddenInputs).length > 0) {
          console.log(`Found ${Object.keys(hiddenInputs).length} hidden form fields (CSRF tokens): ${Object.keys(hiddenInputs).join(', ')}`);
        }

        // Get initial cookies from login page
        const initialCookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
        console.log(`Initial cookies from login page: ${initialCookies.length}`);

        // Try accessing the web events page with Basic Auth first to see if that sets cookies
        // This might be what works - accessing a protected page with Basic Auth can set session cookies
        try {
          console.log('Trying Basic Auth on web events page to get session cookies...');
          const webEventsResponse = await axiosInstance.get('https://bullsconnect.usf.edu/events', {
            auth: {
              username: username,
              password: password
            },
            maxRedirects: 10,
            validateStatus: (status) => status < 500
          });
          
          const webCookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
          console.log(`Cookies after Basic Auth on web events page: ${webCookies.length} (had ${initialCookies.length})`);
          if (webCookies.length > initialCookies.length) {
            console.log('✓ Got additional cookies from Basic Auth on web page!');
            // Verify cookies work by accessing events page again
            const verifyResponse = await axiosInstance.get('https://bullsconnect.usf.edu/events', {
              maxRedirects: 5,
              validateStatus: (status) => status < 500
            });
            const verifyUrl = verifyResponse.request?.res?.responseUrl || verifyResponse.config?.url;
            if (verifyUrl && !verifyUrl.includes('/login')) {
              console.log('✓ Cookies verified - can access events page without Basic Auth!');
              loginSuccess = true;
              authSession = { type: 'cookie', cookies: webCookies };
              lastAuthTime = now;
            }
          }
        } catch (err) {
          console.log('Basic Auth on web page failed:', err.response?.status || err.message);
        }

        // If Basic Auth on web page didn't work, try form submission
        if (!loginSuccess) {
          // Try multiple form field combinations with extracted field names
          const formFieldCombinations = [
          { [usernameField]: username, [passwordField]: password, ...hiddenInputs },
          { username: username, password: password, ...hiddenInputs },
          { email: username, password: password, ...hiddenInputs },
          { user: username, password: password, ...hiddenInputs },
          { login: username, password: password, ...hiddenInputs }
        ];

        for (const formFields of formFieldCombinations) {
          try {
            const formData = new URLSearchParams();
            Object.entries(formFields).forEach(([key, value]) => {
              if (value) formData.append(key, value);
            });
            
            const loginResponse = await axiosInstance.post(
              loginUrl,
              formData.toString(),
              {
                maxRedirects: 10, // Allow more redirects to follow SSO flow
                validateStatus: (status) => status < 500,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Referer': 'https://bullsconnect.usf.edu/login',
                  'Origin': 'https://bullsconnect.usf.edu'
                }
              }
            );

            const cookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
            const cookieCount = cookies ? cookies.length : 0;
            
            // Get final URL from response
            let finalUrl = loginResponse.request?.res?.responseUrl || loginResponse.config?.url;
            if (!finalUrl && loginResponse.headers?.location) {
              finalUrl = loginResponse.headers.location.startsWith('http') 
                ? loginResponse.headers.location 
                : `https://bullsconnect.usf.edu${loginResponse.headers.location}`;
            }
            
            console.log(`Web login attempt (${Object.keys(formFields).filter(k => !hiddenInputs[k]).join(',')}): Status ${loginResponse.status}, Cookies: ${cookieCount}, Final URL: ${finalUrl?.substring(0, 80)}`);
            
            // If we got more cookies than initial, it might have worked
            if (cookieCount > initialCookies.length) {
              // Follow redirects to see where we end up
              if (finalUrl && finalUrl.includes('/login_only')) {
                console.log('  → Login redirected to /login_only (likely failed)');
              } else if (finalUrl && !finalUrl.includes('/login')) {
                console.log('✓ Successfully authenticated via web login with cookies!');
                loginSuccess = true;
                authSession = { type: 'cookie', cookies: cookies };
                lastAuthTime = now;
                break;
              } else {
                // Got cookies but still on login page - try accessing events page to verify
                try {
                  const testResponse = await axiosInstance.get('https://bullsconnect.usf.edu/events', {
                    maxRedirects: 5,
                    validateStatus: (status) => status < 500
                  });
                  const testFinalUrl = testResponse.request?.res?.responseUrl || testResponse.config?.url;
                  if (testFinalUrl && !testFinalUrl.includes('/login')) {
                    console.log('✓ Successfully authenticated! Cookies work for accessing events page.');
                    loginSuccess = true;
                    authSession = { type: 'cookie', cookies: cookies };
                    lastAuthTime = now;
                    break;
                  }
                } catch (testErr) {
                  // Continue trying
                }
              }
            } else if (finalUrl && finalUrl.includes('/login_only')) {
              console.log('  → Login redirected to /login_only (likely failed - wrong credentials or form fields)');
            }
          } catch (err) {
            // Try next combination
            continue;
          }
        }
        }
      } catch (err) {
        console.warn('Web login attempt failed:', err.response?.status || err.message);
      }
    }

    // Try SSO endpoint if available
    if (!loginSuccess) {
      try {
        const ssoResponse = await axiosInstance.post(
          'https://bullsconnect.usf.edu/sso/login',
          {
            username: username,
            password: password
          },
          {
            maxRedirects: 5,
            validateStatus: (status) => status < 500
          }
        );

        const cookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
        const cookieCount = cookies ? cookies.length : 0;
        console.log(`SSO login attempt: Status ${ssoResponse.status}, Cookies: ${cookieCount}`);
        if (cookieCount > 0 || ssoResponse.status === 302 || ssoResponse.status === 301) {
          console.log('Successfully authenticated via SSO');
          loginSuccess = true;
          authSession = true;
          lastAuthTime = now;
        }
      } catch (err) {
        console.log('SSO login failed:', err.response?.status || err.message);
      }
    }

    // Try Basic Auth as a fallback (some APIs support this)
    if (!loginSuccess) {
      try {
        const basicAuthResponse = await axiosInstance.get(
          'https://bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list',
          {
            auth: {
              username: username,
              password: password
            },
            params: { range: 0, limit: 5 },
            validateStatus: (status) => status < 500
          }
        );
        
        if (basicAuthResponse.status === 200) {
          // Check if we got better data with Basic Auth
          const sampleEvents = basicAuthResponse.data || [];
          const hasBetterData = sampleEvents.some(e => {
            const loc = e.p6 || '';
            return loc && !loc.toLowerCase().includes('private location') && !loc.toLowerCase().includes('sign in to display');
          });
          
          console.log(`Successfully authenticated via Basic Auth${hasBetterData ? ' - Getting better location data!' : ' - But still seeing restricted locations'}`);
          // Store Basic Auth credentials for use in event fetching
          authSession = { type: 'basic', username, password };
          loginSuccess = true;
          lastAuthTime = now;
        }
      } catch (err) {
        console.log('Basic Auth attempt failed:', err.response?.status || err.message);
      }
    }

    if (!loginSuccess) {
      console.warn('Could not authenticate with BullsConnect. Proceeding with unauthenticated requests.');
      console.warn('Note: Some events may show "sign in to view" for location data.');
      console.warn('This might be normal if BullsConnect requires browser-based authentication.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Authentication error:', error.message);
    return false;
  }
}

// Fetch events from Bulls Connect API
async function fetchEventsFromAPI() {
  try {
    // Reset unmatched location counter for this fetch
    if (typeof geocodeLocation !== 'undefined') {
      geocodeLocation._unmatchedLogCount = 0;
      geocodeLocation._unmatchedLocations = new Set();
    }
    
    // Authenticate first if credentials are available
    await authenticateBullsConnect();

    // Prepare request config
    const requestConfig = {
      params: {
        range: 0,
        limit: 100,
        filter4: '', // show status
        filter5: '', // group
        filter6: '', // group type
        filter2: '', // category
        filter3: '', // event type
        filter8: '', // location format
        filter9: '', // date range
        filter10: '', // recurring
        orderby_1: 'undefined',
        search_word: ''
      }
    };

    // Prioritize cookie-based authentication over Basic Auth
    const cookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
    if (cookies.length > 0) {
      console.log(`Using ${cookies.length} session cookies for authentication (cookie-based)`);
      // Don't use Basic Auth if we have cookies - cookies are better
    } else if (authSession && authSession.type === 'basic') {
      // Fall back to Basic Auth if no cookies
      requestConfig.auth = {
        username: authSession.username,
        password: authSession.password
      };
      console.log('Using Basic Auth for event fetching (no cookies available)');
    }

    // If we have cookies, try using them for better access
    // Try accessing web events page first to establish better session (if we have cookies)
    if (cookies.length > 0) {
      try {
        console.log(`Using ${cookies.length} cookies - accessing web events page to strengthen session...`);
        const webPageResponse = await axiosInstance.get('https://bullsconnect.usf.edu/events', {
          maxRedirects: 5,
          validateStatus: (status) => status < 500
        });
        // Refresh cookies after accessing web page
        const refreshedCookies = cookieJar.getCookies('https://bullsconnect.usf.edu');
        if (refreshedCookies.length > cookies.length) {
          console.log(`✓ Got ${refreshedCookies.length - cookies.length} additional cookies from web page`);
        }
        const finalUrl = webPageResponse.request?.res?.responseUrl || webPageResponse.config?.url;
        if (finalUrl && !finalUrl.includes('/login')) {
          console.log('✓ Cookies verified - can access web events page!');
        }
      } catch (err) {
        // Continue even if web page access fails
        console.log('Web page access failed, continuing with API...', err.response?.status || err.message);
      }
    }
    
    // Use authenticated axios instance (with cookies and/or Basic Auth)
    let response;
    try {
      response = await axiosInstance.get('https://bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list', requestConfig);
    } catch (err) {
      // If request fails, try without Basic Auth if we have cookies
      if (cookies.length > 0 && requestConfig.auth) {
        console.log('Retrying with cookies only (removing Basic Auth)...');
        delete requestConfig.auth;
        response = await axiosInstance.get('https://bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list', requestConfig);
      } else {
        throw err;
      }
    }

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format');
    }

    // Check how many events have restricted locations even with auth
    const restrictedCount = response.data.filter(e => {
      const loc = e.p6 || '';
      return loc.toLowerCase().includes('private location') || loc.toLowerCase().includes('sign in to display');
    }).length;
    
    const actualLocationCount = response.data.filter(e => {
      const loc = e.p6 || '';
      return loc && loc.trim() !== '' && !loc.toLowerCase().includes('private location') && !loc.toLowerCase().includes('sign in to display');
    }).length;
    
    // Log sample of actual locations we're getting
    const actualLocations = response.data
      .filter(e => {
        const loc = e.p6 || '';
        return loc && loc.trim() !== '' && !loc.toLowerCase().includes('private location') && !loc.toLowerCase().includes('sign in to display');
      })
      .map(e => e.p6)
      .slice(0, 10);
    
    console.log(`  API returned: ${actualLocationCount} with actual locations, ${restrictedCount} still restricted (even with auth)`);
    if (actualLocations.length > 0) {
      console.log(`  Sample actual locations from API: ${actualLocations.join(', ')}`);
    }

    // Transform the data to a more usable format
    let events = response.data
      .map(event => {
        let locationStr = event.p6 || '';
        
        // Log first few location strings to see what we're getting with auth
        const eventIndex = response.data.indexOf(event);
        if (eventIndex < 10 && locationStr) {
          console.log(`  Location [${eventIndex}]: "${locationStr.substring(0, 80)}"`);
        }
        
        // Clean up location string - remove "sign in to view" and "Private Location" messages
        if (locationStr && typeof locationStr === 'string') {
          const locationLower = locationStr.toLowerCase().trim();
          // Check for various restricted message formats
          const isRestricted = 
            locationLower === 'sign in to view' || 
            locationLower === 'sign in' ||
            locationLower === 'sign in to view location' ||
            locationLower === 'private location (sign in to display)' ||
            locationLower === 'private location' ||
            locationLower.startsWith('private location') ||
            locationLower.startsWith('sign in to view') ||
            (locationLower.includes('sign in') && locationLower.includes('display')) ||
            (locationLower.includes('private location') && locationLower.includes('sign in')) ||
            (locationLower.includes('sign in') && locationLower.length < 35 && !locationLower.includes('building'));
          
          if (isRestricted) {
            const originalLocation = locationStr; // Save for logging
            locationStr = ''; // Clear restricted location
            if (eventIndex < 5) {
              console.log(`    → Cleared as restricted: "${originalLocation}"`);
            }
          }
          // Otherwise keep it - it's a real location
        }

        const coords = geocodeLocation(locationStr);
        
        // Skip events with null coordinates (online/virtual events)
        if (!coords) {
          return null;
        }

        // Fix image URLs to include full domain
        let imageUrl = event.p11;
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `https://bullsconnect.usf.edu${imageUrl}`;
        }

        // Clean up values - convert false/null/string "false" to null
        let name = event.p3;
        if (!name || name === false || name === 'false' || String(name).toLowerCase().trim() === 'false' || String(name).trim() === '') {
          name = null;
        }
        
        let organizationName = event.p9;
        if (!organizationName || organizationName === false || organizationName === 'false' || String(organizationName).toLowerCase().trim() === 'false') {
          organizationName = null;
        }

        return {
          id: event.p1,
          uid: event.p2,
          name: name,
          datetime: event.p4,
          category: event.p5,
          location: locationStr,
          coordinates: coords,
          organizationId: event.p7,
          organizationName: organizationName,
          attendeeCount: event.p10 || 0,
          imageUrl: imageUrl,
          price: event.p12,
          buttonLabel: event.p13,
          tags: event.p22,
          customTime: event.p24,
          capacityStatus: event.p26,
          timezone: event.p28
        };
      })
      // Filter out events with invalid names (required field) and null coordinates (online events)
      .filter(event => {
        if (!event || !event.name) return false;
        if (!event.coordinates) return false; // Filter out online/virtual events
        const nameStr = String(event.name).trim().toLowerCase();
        return nameStr !== '' && nameStr !== 'false' && nameStr !== 'null' && nameStr !== 'undefined';
      });

    // Note: Individual event detail endpoint doesn't exist (returns 404)
    // The main events list API with Basic Auth should provide all available location data
    // Some events may genuinely not have location data available

    return events;
  } catch (error) {
    console.error('Error fetching events:', error.message);
    throw error;
  }
}

// API endpoint to get all events
app.get('/api/events', async (req, res) => {
  try {
    // Check if cache should be cleared (query parameter)
    const forceRefresh = req.query.refresh === 'true';
    
    if (forceRefresh) {
      cache.del('events');
      console.log('Cache cleared, fetching fresh events...');
    }
    
    // Check cache first
    const cachedEvents = cache.get('events');
    if (cachedEvents && !forceRefresh) {
      console.log('Returning cached events');
      // Double-check cached events are valid (filter again as safety)
      const validCachedEvents = cachedEvents.filter(event => {
        if (!event.name) return false;
        const nameStr = String(event.name).trim().toLowerCase();
        return nameStr !== '' && nameStr !== 'false' && nameStr !== 'null' && nameStr !== 'undefined';
      });
      return res.json(validCachedEvents);
    }

    // Fetch fresh data
    console.log('Fetching fresh events from Bulls Connect...');
    const events = await fetchEventsFromAPI();

    // Log statistics about fetched events
    const eventsWithLocations = events.filter(e => e.location && e.location.trim() !== '' && !e.location.toLowerCase().includes('sign in'));
    const eventsWithRestrictedLocations = events.filter(e => !e.location || e.location.trim() === '' || e.location.toLowerCase().includes('sign in'));
    
    // Count events at default location (coordinates are exactly campus center)
    const eventsAtDefaultLocation = events.filter(e => 
      e.coordinates && 
      e.coordinates.lat === 28.0650 && 
      e.coordinates.lng === -82.4170
    );
    
    // Log sample of events with locations that might not be matched
    // These are events that have a location string but are still at campus center coordinates
    const eventsWithUnmatchedLocations = events.filter(e => 
      e.location && 
      e.location.trim() !== '' && 
      !e.location.toLowerCase().includes('sign in') &&
      !e.location.toLowerCase().includes('private location') &&
      !e.location.toLowerCase().includes('online') &&
      !e.location.toLowerCase().includes('virtual') &&
      e.coordinates && 
      e.coordinates.lat === 28.0650 && 
      e.coordinates.lng === -82.4170 &&
      e.coordinates.name && 
      e.coordinates.name !== 'USF Tampa Campus' && // Has a location name but defaulted to center
      e.coordinates.name.trim() !== '' // Make sure name is not empty
    );
    
    if (eventsWithUnmatchedLocations.length > 0) {
      console.log(`  ⚠ ${eventsWithUnmatchedLocations.length} events have locations but defaulted to campus center:`);
      eventsWithUnmatchedLocations.slice(0, 15).forEach(e => {
        console.log(`    - "${e.name?.substring(0, 50)}": "${e.location}"`);
      });
      console.log(`  → These locations need to be added to the USF_LOCATIONS dictionary`);
    } else {
      console.log(`  ✓ All events with locations were successfully matched!`);
    }
    
    console.log(`Fetched ${events.length} events total:`);
    console.log(`  - ${eventsWithLocations.length} with actual locations`);
    console.log(`  - ${eventsWithRestrictedLocations.length} with restricted/missing locations`);
    console.log(`  - ${eventsAtDefaultLocation.length} defaulting to USF Tampa Campus`);

    // Cache the results
    cache.set('events', events);

    res.json(events);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clear cache endpoint
app.post('/api/clear-cache', (req, res) => {
  cache.del('events');
  res.json({ status: 'ok', message: 'Cache cleared' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Events endpoint: http://localhost:${PORT}/api/events`);
});
