import axios, { AxiosError } from 'axios';

async function testGetUsers() {
  try {
    // First get a token
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'test@example.com',
      password: 'Test@123'
    });
    
    const token = loginResponse.data.token;
    console.log('Authentication successful, token:', token);
    
    // Now use token to get users
    const usersResponse = await axios.get('http://localhost:4000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Users API raw response:', JSON.stringify(usersResponse.data, null, 2));
    console.log('Users API data property type:', typeof usersResponse.data);
    
    // Check the structure to see what's happening
    if (usersResponse.data && usersResponse.data.data) {
      console.log('Users array is nested in data.data:', usersResponse.data.data);
      console.log('Number of users:', usersResponse.data.data.length);
    } else {
      console.log('Users array structure is different than expected');
      console.log('Direct content:', usersResponse.data);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error in test:', error.response?.data || error.message);
    } else {
      console.error('Error in test:', error);
    }
  }
}

testGetUsers(); 