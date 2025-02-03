import axios from 'axios';
                   

export const API_URL = 'http://13.60.180.213:3000/api';
export const baseURL = 'http://13.60.180.213:3000';
// const API_URL = 'http://192.168.0.103:3000/api';
//13.60.180.213
// 172.20.10.5

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
export const registerRestaurant = async (restaurantName: string, email: string, phone: string, address: string, description: string, profileImage: string) => {
  try {
    const response = await api.post('/restaurant/signup', {restaurantName, email, phone, address, description, profileImage});
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
  user_id: string;
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

// Function to fetch an order by user ID
export const fetchOrder = async (user_id: string) => {
  try {
    const response = await api.get(`/orders/get`, {
      params: { user_id }, 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};


// Function to delete an order by ID
export const deleteOrder = async (orderId: string, userId?: string) => {
  try {
    const payload = userId ? { userId } : {};
    const response = await api.delete(`/orders/${orderId}`, { data: payload });
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Function to update an existing order
export const updateOrder = async (orderId: string, updatedData: Partial<{
  items: { id: string; quantity: number }[];
  totalAmount: number;
  note?: string;
  status?: string;
}>) => {
  try {
    const response = await api.put(`/orders/${orderId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};



// Function to update the quantity of a dish in the cart
export const updateCartQuantity = async (user_id: string, dishId: string, quantity: number) => {
  try {
    const response = await api.put('/cart/update-quantity', {
      user_id,
      dishId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};


// Function to update the user's coordinates
export const updateUserCoordinates = async (
  userId: string,
  latitude: number,
  longitude: number,
  confirmLocation: boolean = true
) => {
  try {
    const response = await api.put('/location/confirm', {
      userId,
      latitude,
      longitude,
      confirmLocation,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user coordinates:', error);
    throw error;
  }
};



// Function to save a rating
export const saveRating = async (userId: string, restaurantId: string, rating: number, userRating: number) => {
  try {
    const response = await api.post('/ratings/add', {
      userId,
      restaurantId,
      rating,
      userRating,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
};

// Function to fetch the user's rating for a restaurant
export const getUserRating = async (userId: string, restaurantId: string) => {
  try {
    const response = await api.get(`/ratings/${restaurantId}`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    throw error;
  }
};

// Function to save a review
export const saveReview = async (userId: string, restaurantId: string, review: string) => {
  try {
    const response = await api.post('/reviews/add', {
      userId,
      restaurantId,
      review,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving review:', error);
    throw error;
  }
};

// Function to fetch reviews for a restaurant
export const getReviews = async (restaurantId: string) => {
  try {
    const response = await api.get(`/reviews/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};


// Function to save a rating
export const saveDishRating = async (userId: string, dishId: string, rating: number, userRating: number) => {
  try {
    const response = await api.post('/ratings/add-dish', {
      userId,
      dishId,
      rating,
      userRating,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
};

// Function to fetch the user's rating for a restaurant
export const getUserDishRating = async (userId: string, dishId: string) => {
  try {
    const response = await api.get(`/ratings/${dishId}`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    throw error;
  }
};

// Function to save a review
export const saveDishReview = async (userId: string, dishId: string, review: string) => {
  try {
    const response = await api.post('/reviews/add-dish', {
      userId,
      dishId,
      review,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving review:', error);
    throw error;
  }
};

// Function to fetch reviews for a restaurant
export const getDishReviews = async (dishId: string) => {
  try {
    const response = await api.get(`/reviews/${dishId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};