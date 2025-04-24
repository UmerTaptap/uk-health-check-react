import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

// Reusing the same theme from signup page
const theme = {
  primary: '#E05F20',  // Your brand color
  primaryLight: '#F08A5D',
  primaryDark: '#C14A0C',
  secondary: '#667eea',
  background: '#f8f9fa',
  textDark: '#333',
  textLight: '#666',
  white: '#ffffff',
  grayLight: '#f5f5f5'
};

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.background};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const LeftPanel = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${theme.white};
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RightPanel = styled(motion.div)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const FormContainer = styled(motion.div)`
  background: ${theme.white};
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: ${theme.primary};
  text-align: center;
  font-weight: 700;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const InputLabel = styled.label`
  position: absolute;
  top: 15px;
  left: 15px;
  color: ${theme.textLight};
  font-size: 1rem;
  transition: all 0.3s ease;
  pointer-events: none;
`;

const InputField = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: ${theme.grayLight};

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(224, 95, 32, 0.2);
  }

  &:focus + ${InputLabel}, &:not(:placeholder-shown) + ${InputLabel} {
    top: -10px;
    left: 10px;
    font-size: 0.8rem;
    background: ${theme.white};
    padding: 0 5px;
    color: ${theme.primary};
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background: linear-gradient(to right, ${theme.primary}, ${theme.primaryDark});
  color: ${theme.white};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(224, 95, 32, 0.4);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(to right, ${theme.primaryLight}, ${theme.primary});
  }
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`;

const RememberMe = styled.div`
  display: flex;
  align-items: center;

  input {
    margin-right: 8px;
    accent-color: ${theme.primary};
  }

  label {
    color: ${theme.textLight};
    font-size: 0.9rem;
  }
`;

const ForgotPassword = styled(Link)`
  color: ${theme.primary};
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${theme.primaryDark};
    text-decoration: underline;
  }
`;

const SocialLogin = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const SocialIcon = styled(motion.div)`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.grayLight};
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: ${theme.textLight};

  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &::before {
    margin-right: 1rem;
  }

  &::after {
    margin-left: 1rem;
  }
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: ${theme.textLight};

  a {
    color: ${theme.primary};
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: ${theme.primaryDark};
    }
  }
`;

const WelcomeTitle = styled(motion.h1)`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
  color: ${theme.white};
  font-weight: 700;
  position: relative;
  z-index: 2;
`;

const WelcomeSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  text-align: center;
  max-width: 80%;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 2;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const navigate = useNavigate();

  const handleChange = (e: { target: { name: any; value: any; type: any; checked: any; }; }) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      if (result.message === 'User not exists') {
        alert('User not exists!');
      } else if (result.message === 'Login Successful') {
        
        const token = result.data.token;

        console.log('Login successful:', result.data.token);
        alert('User login successfully!');
        navigate('/dashboard'); // Redirect to dashboard after successful signup
      }

    } catch (error) {
      console.error('Error during signup:', error);
    }
    setTimeout(() => {
      // navigate('/dashboard');
    }, 1500);
  };

  return (
    <LoginContainer>
      <LeftPanel
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <WelcomeTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Welcome Back!
        </WelcomeTitle>
        <WelcomeSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          We're so excited to see you again! Log in to access your personalized dashboard.
        </WelcomeSubtitle>
      </LeftPanel>

      <RightPanel
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <FormContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Title>Login to Your Account</Title>

          <form onSubmit={handleSubmit}>
            <InputGroup>
              <InputField
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <InputLabel>Email Address</InputLabel>
            </InputGroup>

            <InputGroup>
              <InputField
                type="password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <InputLabel>Password</InputLabel>
            </InputGroup>

            <RememberForgot>
              <RememberMe>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </RememberMe>
              <ForgotPassword to="/forgot-password">Forgot password?</ForgotPassword>
            </RememberForgot>

            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </SubmitButton>
          </form>

          <Divider>or login with</Divider>

          <SocialLogin>
            <SocialIcon whileHover={{ scale: 1.1, y: -3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#DB4437">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
              </svg>
            </SocialIcon>
            <SocialIcon whileHover={{ scale: 1.1, y: -3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4267B2">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
              </svg>
            </SocialIcon>
            <SocialIcon whileHover={{ scale: 1.1, y: -3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
              </svg>
            </SocialIcon>
          </SocialLogin>

          <SignupLink>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </SignupLink>
        </FormContainer>
      </RightPanel>
    </LoginContainer>
  );
};

export default Login;