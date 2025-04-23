import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

// Reusing the same theme
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

const ForgotPasswordContainer = styled.div`
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

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${theme.textLight};
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
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

const SuccessMessage = styled(motion.div)`
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #27ae60;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const BackToLogin = styled.div`
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <ForgotPasswordContainer>
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
          Reset Your Password
        </WelcomeTitle>
        <WelcomeSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Enter your email address and we'll send you a link to reset your password.
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
          <Title>Forgot Password</Title>
          <Subtitle>
            Please enter the email address associated with your account.
          </Subtitle>
          
          {isSubmitted ? (
            <SuccessMessage
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              Password reset link has been sent to your email address.
            </SuccessMessage>
          ) : (
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <InputField 
                  type="email" 
                  name="email" 
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <InputLabel>Email Address</InputLabel>
              </InputGroup>

              <SubmitButton
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </SubmitButton>
            </form>
          )}

          <BackToLogin>
            Remember your password? <Link to="/login">Login</Link>
          </BackToLogin>
        </FormContainer>
      </RightPanel>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;