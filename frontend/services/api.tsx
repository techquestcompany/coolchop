import axios from 'axios';
                   

const API_URL = 'http://172.20.10.4:3000/api';
// const API_URL = 'http://192.168.0.103:3000/api';


export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
  
interface Dish {
  dishName: string;
  description: string;
  price: number;
  ingredients: string;
  category: string;
  restaurantId: string;
}

// Function to handle user signup
export const signUp = async (name: string, email: string, phone: string,  password: string) => {
  try {
    const response = await api.post('/user/signup', {name, email, phone, password});
    return response.data;
  } catch (error:string) {
    if (error.response) {
      // Backend returned a response with an error
      console.error('Server Error:', error.response.data);
    } else {
      // Other error (network issues, timeout, etc.)
      console.error('Error signing up:', error.message);
    }
    throw error;
  }
};

// Function to handle user login
export const login = async (email: string, password: string, latitude: string, longitude: string) => {
  try {
    const response = await api.post('/user/login', { email, password, latitude, longitude });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Function to handle getting user data
export const confimrUserLocation = async (token: string) => {
  try {
    const response = await api.get('/location/check', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting location data:', error);
    throw error;
  }
};

// Function to handle getting user data
export const confirmNewLocation = async (token: string, latitude: string, longitude: string) => {
  try {
    const response = await api.get('/location/confirm', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      longitude,
      latitude
    });
    return response.data;
  } catch (error) {
    console.error('Error getting location data:', error);
    throw error;
  }
};

// Function to handle getting user data
export const getUserData = async (token: string) => {
  try {
    const response = await api.get('/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};


// Function to handle user login
export const verify = async (email: string, code: string) => {
  try {
    const response = await api.post('/user/verify', { email, code });
    return response.data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

export const uploadImage = async (profileImage: string) => {
  const formData = new FormData();
  formData.append('profileImage', {
    uri: profileImage,
    type: 'image/jpeg', // Adjust this based on the image type
    name: 'profileImage.jpg', // Provide a filename
  });

  try {
    const response = await api.post('/upload/upload_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }   
};      
  

// Function to handle restaurant resgistration
export const registerRestaurant = async (restaurantName: string, email: string, phone: string, address: string) => {
  try {
    const response = await api.post('/restaurant/signup', {restaurantName, email, phone, address});
    return response.data;
  } catch (error) {
    console.error('Error resgistering restaurant:', error);
    throw error;
  }
};

// Function to handle restaurant login
export const loginRestaurant = async (restaurantId: string, password: string, latitude: string, longitude: string) => {
  try {
    const response = await api.post('/restaurant/login', { restaurantId, password, latitude, longitude });
    return response.data;
  } catch (error) {
    console.error('Error logging in restaurant:', error);
    throw error;
  }
};


export const submitDishes = async (dishes: Dish[]): Promise<any> => {
  try {
    const response = await api.post('/restaurant/dish', { dishes });
    console.log("Response data:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    const response = await api.get('restaurant/restaurants');
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants', error);
    throw error;
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id: string) => {
  try {
    const response = await api.get('restaurant/myrestaurant', {
      headers: {
        Authorization: `Bearer ${id}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant with ID: ${id}`, error);
    throw error;
  }
};

// Get all dishes
export const getAllDishes = async () => {
  try {
    const response = await api.get('restaurant/dishes');
    return response.data;
  } catch (error) {
    console.error('Error fetching dishes', error);
    throw error;
  }
};

// Get dish by ID
export const getDishById = async (id: string) => {
  try {
    const response = await api.get('restaurant/mydishes', {
      headers: {
        Authorization: `Bearer ${id}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching dish with ID: ${id}`, error);
    throw error;
  }
};


// Function to verify if the token is valid
export const verifyToken = async (token: string) => {
  try {
    const response = await api.post('/user/token', { token }); 
    return response.data.isValid; 
  } catch (error) {
    throw error;
  }
};

// Get uset by ID
export const getUserbyId = async (id: string) => {
  try {
    const response = await api.get('user/id', {
      headers: {
        Authorization: `Bearer ${id}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id: ${id}`, error);
    throw error;
  }
};