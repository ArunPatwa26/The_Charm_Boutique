import api from './api';

// ==========================================
// REGISTER
// ==========================================

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const data = response.data;

    if (data?.success) {
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Register Error:', error);
    throw error.response?.data || {
      success: false,
      message: 'Registration failed',
    };
  }
};


// ==========================================
// LOGIN
// ==========================================

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    if (data?.success) {
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error.response?.data || {
      success: false,
      message: 'Login failed',
    };
  }
};


// ==========================================
// GOOGLE LOGIN
// ==========================================

export const googleLogin = async (credential) => {
  try {
    const formData = new FormData();
    formData.append('credential', credential);

    const response = await api.post('/auth/google', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;

    if (data?.success) {
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Google Login Error:', error);
    throw error.response?.data || {
      success: false,
      message: 'Google login failed',
    };
  }
};


// ==========================================
// GET CURRENT USER
// ==========================================

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get Current User Error:', error);
    throw error.response?.data || {
      success: false,
      message: 'Failed to get current user',
    };
  }
};


// ==========================================
// LOGOUT
// ==========================================

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { success: true, message: 'Logged out successfully' };
};


// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = async (formData) => {
  try {
    if (!(formData instanceof FormData)) {
      throw new Error('updateProfile expects FormData');
    }

    const response = await api.put('/auth/update-profile', formData);
    const data = response.data;

    if (data?.success && data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Update Profile Error:', error);
    throw error.response?.data || {
      success: false,
      message: 'Failed to update profile',
    };
  }
};


// ==========================================
// SET / CHANGE PASSWORD
// ==========================================
// Used by Google-only users to set a password for the first time,
// or by regular users to change their existing password.
//
// - Google-only users: call setPassword('newpass') — currentPassword not needed
// - Existing users:    call setPassword('newpass', 'oldpass') — required for security

export const setPassword = async (password, currentPassword = null) => {
  try {
    const body = { password };

    if (currentPassword) {
      body.current_password = currentPassword;
    }

    const response = await api.post('/auth/set-password', body);
    const data = response.data;

    // Update local user object so UI immediately reflects `has_password: true`
    if (data?.success && data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Set Password Error:', error);
    throw error.response?.data || {
      success: false,
      message: 'Failed to set password',
    };
  }
};