import axios from "axios";
                   
                                    
export const API_URL = 'http://192.168.65.9:3000/api';
export const baseURL = 'http://192.168.65.9:3000';

//export const API_URL = "https://www.coolchop.info.anglabytestudio.com/api"
//export const BASE_URL = "https://www.coolchop.info.anglabytestudio.com/"
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
export const signUp = async (name: string, email: string, phone: string,  password: string, role: string) => {
  try {
    const response = await api.post('/user/signup', {name, email, phone, password,role});
    return response.data;
  } catch (error:string) {
    if (error.response) {
      
      console.error('Server Error:', error.response.data);
    } else {
      
      console.error('Error signing up:', error.message);
    }
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    console.log("Attempting to log in with:", email, password);

    const response = await api.post('/user/login', { email, password });
    
    console.log("Login Response:", response.data); 

    return response.data;
  } catch (error) {
    if (error.response) {
    
      console.error("Server Error:", error.response.data);
      console.error("Status Code:", error.response.status);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request Error:", error.message);
    }
    throw error;
  }
};


// Function to handle getting user data
export const confirmUserLocation = async (token: string) => {
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
export const getAllUsers = async (page =1 , limit=10) => {
  try {
    const response = await api.get(`/user/allUsers?page=${page}&limit=${limit}`, 
      
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error?.response.data);
    throw error;
  }
};

export const approveRestaurantById = async (id) =>{
  try {
    const response = await api.patch(`/restaurant/approve/${id}`, 
      
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error?.response.data);
    throw error;
  }
}


export const deleteUserById = async (id) => {
  try {
    const response = await api.delete(`/user/${id}`, 
      
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error?.response.data);
    throw error;
  }
};

export const updateUserData = async (data, token) => {
  try {
    const response = await api.put('/user/update_data', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};


// Function to verify the user account 
export const  verify = async (email: string, code: string) => {
  try {
    const response = await api.post('/user/verify', { email, code });           
    return response.data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

// Function 
export const passResetVerifyCode = async (email: string, code: string) => {
  try {
    const response = await api.post('/user/verify', { email, code });
    console.log('Verification response:', response.data); 
    return response.data;  
  } catch (error) {
    console.error('Error verifying code:', error.response?.data);
    throw error.response?.data || { message: 'Unknown error' };
  }
};


export const sendVerification= async (email: string)=>{
  try {
    const response = await api.post('/user/forgottenPassword', { email });
    return response.data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }

}
export const uploadImage = async (profileImage: string) => {
  const formData = new FormData();
  formData.append('profileImage', {
    uri: profileImage,
    type: 'image/jpeg', //Adjust this based on the image type
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
export const registerRestaurant = async (restaurantName: string, email: string, phone: string, address: string, description: string,password:string) => {
  try {
    const response = await api.post('/restaurant/signup', {restaurantName, email, phone, address, description,password});
    return response.data;
  } catch (error) {
    console.error('Error registering restaurant:', error);
    throw error;
  }
};

// Function to handle restaurant login
export const loginRestaurant = async (email : string, password : string) => {
  try {
    const response = await api.post('/restaurant/login', { email,password});
    return response.data;
  } catch (error) {
    console.error('Error logging in restaurant:', error);
    throw error;
  }
};

export const updateRestaurantData = async (restaurantName: string, email: string, phone: string, address: string, description: string, paymentInfo: number,operationalHours:string, token:string)=>{
  try{
  const response = await api.post('/restaurant/update',{restaurantName, email, phone, address, description,paymentInfo,operationalHours},{
    headers:{
      "Authorization":`Bearer ${token} `
    }
  })
  }catch(error){

  }

}
export const submitDishes = async (dishes ,token:string): Promise<any> => {
  try {
    const response = await api.post('/restaurant/create_dishes', { dishes },{
      headers:{
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response data:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all restaurants
export const getAllRestaurants = async (page= 1, limit =10) => {
  try {
    const response = await api.get(`restaurant/restaurants?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants', error);
    throw error;
  }
};

// Get restaurant by ID
export const getRestaurantById = async (token:string) => {
  try {
    const response = await api.get('restaurant/myrestaurant', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant with ID: ${token}`, error);
    throw error;
  }
};

export const deleteRestaurantById = async (id) => {
  try {
    const response = await fetch(`/restaurants/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete restaurant');
    }

    return true; // success
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const getDishesByRestaurantId = async (token: string) => {
  try {
    const response = await api.get('restaurant/restaurant_dish', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant with ID: ${id}`, error);
    throw error;
  }
};

// Get all dishes
export const getAllDishes = async (page = 1, limit=20) => {
  try {
    const response = await api.get(`restaurant/dishes?page=${page}&limit=${limit}`);
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
export const addDishToCart = async (user_id: string, dishId: string, quantity: number = 1,token: string) => {
  try {
    const response = await api.post('/cart/add', { user_id, dishId, quantity },{headers:{Authorization:`Bearer ${token}`}});
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCartItems = async (user_id: string, token: string) => {
  try {
    const response = await api.get('/cart/get', {
      params: { user_id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
  userId: number;
  items: { id: number; quantity: number }[];
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

export const fetchOrdersByUser = async (token: string) => {
  try {
    const response = await api.get('/orders/user_orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Function to fetch an order by user ID
export const fetchAllOrders = async () => {
  try {
    const response = await api.get(`/orders/get`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
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
export const updateCartQuantity = async ( dishId: string, quantity: number,token:string) => {
  try {
    const response = await api.put('/cart/update-quantity', {
       
      dishId,
      quantity,
    },
  {headers:{Authorization:`Bearer ${token}`}});
    return response.data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

export const deleteDeleteCartItem = async ( dishId:string,token: string)=>{
  try {
    const response = await api.delete(`/cart/remove/${dishId}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
     
    }
  )
  return response.data
  } catch (error) {
    console.error('Deleting cart quantity:', error);
    throw error;
  }
}


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

export const changePassword = async (newPassword:string,confirmPassword:string,email:string)=>{
  try{

    const response = await api.post("/user/changePassword",{newPassword,confirmPassword,email})
    console.log("change password data",response.data)
    return response.data

  }catch(error){
    console.log("error changing password",error.response?.data)
  }

}
export const deleteAccount =async (token:string)=>{
  try{
    const response = await fetch('/users/deleteAccount', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {

      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to delete account' };
    }
  }
  catch(e){
    return { success: false, message: error.message };

  }
}
// Handle saving the notification method and sending it to the backend
 export const saveNotificationPreference = async (notificationMethod) => {
    try {
      const response = await axios.post('/notfication/addNotifcation', notificationMethod);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'There was an error saving your preferences.');
    }
    
  };

  // initialise payment transaction to the paystack endpoint
  export const InitTransactionReq  = async (email:string,amount:number) =>{
    try {
      const response =await api.post("/payments/initialise",{email,amount})
      return  response.data
      console.log(response.data)
    } catch (error) {
 console.error('Error initialising a transaction:', error?.response?.data || error.message);

      
    }
  }