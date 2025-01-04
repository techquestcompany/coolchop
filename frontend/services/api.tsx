import axios from 'axios';
                   

export const API_URL = 'http://172.20.10.4:3000/api';
export const baseURL = 'http://172.20.10.4:3000';
// const API_URL = 'http://192.168.0.103:3000/api';
//154.161.20.4/32

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
export const signUp = async (name: string, email: string, phone: string,  password: string, profileImage: string) => {
  try {
    const response = await api.post('/user/signup', {name, email, phone, password, profileImage});
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
export const  verify = async (email: string, code: string) => {
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
export const registerRestaurant = async (restaurantName: string, email: string, phone: string, address: string, profileImage: string) => {
  try {
    const response = await api.post('/restaurant/signup', {restaurantName, email, phone, address, profileImage});
    return response.data;
  } catch (error) {
    console.error('Error resgistering restaurant:', error);
    throw error;
  }
};

// Function to handle restaurant login
export const loginRestaurant = async (restaurantId: string, latitude: string, longitude: string) => {
  try {
    const response = await api.post('/restaurant/login', { restaurantId, latitude, longitude });
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

export const getDishesByRestaurantId = async (id: string) => {
  try {
    const response = await api.get('restaurant/restaurant_dish', {
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


// Function to verify if the token is valid
export const verifyResToken = async (token: string) => {
  try {
    const response = await api.post('/restaurant/token', { token }); 
    return response.data.isValid; 
  } catch (error) {
    throw error;
  }
};


// Function to add a dish to the cart
export const addDishToCart = async (user_id: string, dishId: string, quantity: number = 1) => {
  try {
    const response = await api.post('/cart/add', { user_id, dishId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Function to get cart items for a user
export const getCartItems = async (user_id: string) => {
  try {
    const response = await api.get('/cart/get', { params: { user_id } });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Function to delete a dish from the cart
export const deleteFromCart = async (user_id: string, dishId: string) => {
  try {
    const response = await api.delete('/cart/remove', { data: { user_id, dishId } });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Function to save an order
export const saveOrder = async (order: {
  userId: string;
  items: { id: string; quantity: number }[];
  note?: string;
}) => {
  try {
    const response = await api.post('/orders/save', order);
    return response.data;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};


// Function to update the quantity of a dish in the cart
export const updateCartQuantity = async (userId: string, dishId: string, quantity: number) => {
  try {
    const response = await api.put('/cart/update-quantity', {
      userId,
      dishId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};
