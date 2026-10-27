import axios from "axios";
import Constants from "expo-constants";



export const API_URL = "https://www.coolchop.xyz/api"
export const BASE_URL = "https://www.coolchop.xyz/api"
// const API_URL = 'http://192.168.0.103:3000/api';
//13.60.180.213
// 172.20.10.5

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const body = data as { error?: unknown; message?: unknown };
      if (typeof body.message === "string") return body.message;
      if (typeof body.error === "string") return body.error;
    }
    if (!error.response) {
      return "We couldn't connect to the server. Check your internet connection and try again.";
    }
  }

  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const message = (error as { error?: unknown; message?: unknown }).message
      ?? (error as { error?: unknown }).error;
    if (typeof message === "string") return message;
  }
  return fallback;
};

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      if (responseData && typeof responseData === "object") {
        const body = responseData as { error?: unknown; message?: unknown };
        const message =
          typeof body.message === "string"
            ? body.message
            : typeof body.error === "string"
              ? body.error
              : undefined;
        if (message) error.message = message;
      } else if (!error.response) {
        error.message = "We couldn't connect to the server. Check your internet connection and try again.";
      }
    }
    return Promise.reject(error);
  }
);
  
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
  const response = await api.post('/user/signup', {name, email, phone, password,role});
  return response.data;
 };

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/user/login', { email, password });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Sign-in request failed:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("Sign-in request received no response:", error.request);
      } else {
        console.error("Sign-in request could not be created:", error.message);
      }
    } else {
      console.error("Sign-in request failed:", error);
    }
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
export const getAllUsers = async (token: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/user/allUsers?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}`, },
    });
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error getting user data:',
      axios.isAxiosError(error) ? error.response?.data : error
    );
    throw error;
  }
};

export const approveRestaurantById = async (id, token: string) =>{
  try {
    const response = await api.patch(`/restaurant/approve/${id}`, 
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error approving restaurant:',
      axios.isAxiosError(error) ? error.response?.data : error
    );
    throw error;
  }
}


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
  } catch (error: unknown) {
    console.error(
      'Error verifying code:',
      axios.isAxiosError(error) ? error.response?.data : error
    );
    throw error;
  }
};

export const changePassword = async (
  newPassword,
  confirmPassword,
  email,
  resetToken
) => {
  const response = await api.post('/user/changePassword', {
    newPassword,
    confirmPassword,
    email,
    resetToken,
  });

  return response.data;
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
export const uploadImage = async (profileImage: string, token: string) => {
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
        Authorization: `Bearer ${token}`,
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

export const updateRestaurantData = async (
  profile: {
    restaurantName?: string;
    email?: string;
    phone?: string;
    address?: string;
    description?: string;
  },
  token: string
) => {
  const response = await api.patch('/restaurant/myrestaurant', profile, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const submitDishes = async (dishes ,token:string): Promise<any> => {
  try {
    const response = await api.post('/restaurant/dish', { dishes },{
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
export const getRestaurantById = async (restaurantId: string | number) => {
  try {
    const response = await api.get(`/restaurant/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant with ID: ${restaurantId}`, error);
    throw error;
  }
};

export const getMyRestaurant = async (token: string) => {
  const response = await api.get('/restaurant/myrestaurant', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getDishesByRestaurantId = async (restaurantId: string | number) => {
  try {
    const response = await api.get(`/restaurant/restaurants/${restaurantId}/dishes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching dishes for restaurant ${restaurantId}:`, error);
    throw error;
  }
};

export const getMyRestaurantDishes = async (token: string) => {
  try {
    const response = await api.get('restaurant/restaurant_dish', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant dishes:', error);
    throw error;
  }
};

// Get all dishes
export const getAllDishes = async (search = "", page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    });
    const response = await api.get(`restaurant/dishes?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dishes', error);
    throw error;
  }
};

export const getDishById = async (id) => {
  try {
    const response = await api.get(`restaurant/dish/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching dish with ID: ${id}`, error);
    throw error;
  }
};

// services/api.ts
export const deleteDish = async (dishId: string, token: string) => {
  try {
    const response = await api.delete(`/restaurant/dish/${dishId}`, {  // include "restaurant" prefix
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting dish with ID: ${dishId}`, error);
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
export const fetchAllOrders = async (token: string) => {
  try {
    const response = await api.get('/orders/all_orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const fetchRestaurantOrders = async (token: string) => {
  const response = await api.get('/orders/restaurant_orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};



// Function to delete an order by ID
export const deleteOrder = async (orderId: string, token: string) => {
  try {
    const response = await api.delete(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
export const updateOrder = async (
  orderId: string,
  updatedData: { status?: string },
  token: string
) => {
  const response = await api.put(`/orders/${orderId}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
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

export const deleteCartItem = async ( dishId:string,token: string)=>{
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


//  Update user location
export const updateUserLocation = async (
  token: string,
  latitude: number,
  longitude: number,
  confirmLocation = true
) => {
  const response = await api.post(
    "/user/location",
    {
      latitude,
      longitude,
      
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};



export const saveRating = async (dishId: number, userRating: number, token: string) => {
  try {
    const response = await api.post(
      '/ratings/add',
      {
        dishId,
        userRating
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

export const getUserDishRatings = async (dishId: number) => {
  try {
    const response = await api.get(`/ratings/dish/${dishId}`);
    return response.data; // returns { ratings: [...] }
  } catch (error) {
    console.error("Error fetching dish ratings:", error);
    throw error;
  }
};


// Function to save a review
export const saveDishReview = async (dishId: string, review: string, token: string) => {
  try {
    const response = await api.post(
      '/reviews/add',
      {
        dishId,
        review,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,  // ✔ send token for backend userId
        },
      }
    );

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
  catch(error: unknown){
    return {
      success: false,
      message: getApiErrorMessage(error, "We couldn't delete your account right now. Please try again."),
    };
  }
}
// Handle saving the notification method and sending it to the backend
 export const saveNotificationPreference = async (notificationMethod) => {
    try {
      const response = await axios.post('/notfication/addNotifcation', notificationMethod);
      return response.data;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
    
  };

 export const InitTransactionReq = async (
  order: { items: { id: number; quantity: number }[]; note?: string },
  token: string
) => {
  try {
    const response = await api.post("/payments/initialise", order, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error initialising a transaction:", error?.response?.data || error.message);
    throw error;
  }
};

  

  export const fetchUserTransactions = async (token, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/transactions/userTransactions`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching transactions:", err);
    throw err;
  }
};
/* 🔥 Rider APIs */
export const getRiderOrders = async () =>{

  try{
const response = await api.get('/orders/rider_orders');
return response.data;
  }catch(error){
console.error('Error fetching rider orders:', error);
throw error;
  }
}

export const acceptRiderOrder = (orderId: number, token: string) =>
  api.post(
    `/rider/orders/${orderId}/accept`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const getMyCart = async (token: string) => {
  const response = await api.get('/cart/get', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addToMyCart = async (dishId: number | string, quantity: number, token: string) => {
  const response = await api.post(
    '/cart/add',
    { dishId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const setMyCartQuantity = async (
  dishId: number | string,
  quantity: number,
  token: string
) => {
  const response = await api.put(
    '/cart/update-quantity',
    { dishId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const removeFromMyCart = async (dishId: number | string, token: string) => {
  const response = await api.delete('/cart/remove', {
    data: { dishId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const reconcilePayment = async (reference: string, token: string) => {
  const response = await api.post(
    `/payments/reconcile/${encodeURIComponent(reference)}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};