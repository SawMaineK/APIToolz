import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { Alert, KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import axios from 'axios';

const TwoFactorAuth = () => {
  const { verify2fa } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [isLoading, setLoading] = useState(false);
  const [showError, hasError] = useState(false);
  const [error, setError] = useState(undefined);
  const [codeInputs, setCodeInputs] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60); // Initialize the countdown to 60 seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { state } = useLocation();
  const { email } = state || {};

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const updatedInputs = [...codeInputs];
    updatedInputs[index] = value;
    setCodeInputs(updatedInputs);

    // Move focus to the next input if the current one is filled
    if (value && index < codeInputs.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeInputs[index]) {
      // Focus on the previous input if current one is empty
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const isButtonDisabled = codeInputs.some((input) => input === '');

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');

    // Mask the username part (except the first letter)
    const maskedUsername = username[0] + '*'.repeat(username.length - 1);

    return `${maskedUsername}@${domain}`;
  };

  const handleContinue = async (e: any) => {
    e.preventDefault();
    try {
      if (!verify2fa) {
        throw new Error('JWTProvider is required for this form.');
      }
      setLoading(true);
      await verify2fa(email, codeInputs.join(''));
      navigate(from, { replace: true });
    } catch (error: any) {
      setLoading(false);
      hasError(true);
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        console.error(`HTTP ${status} Error:`, data.message || 'Bad Request');
        setError(data.message);
      } else {
        console.error('Unexpected Error:', error?.message || error);
      }
    }
  };

  return (
    <div className="card max-w-[390px] w-full">
      <form className="card-body flex flex-col gap-5 p-10" onSubmit={handleContinue}>
        <img
          src={toAbsoluteUrl('/media/illustrations/34.svg')}
          className="dark:hidden h-20 mb-2"
          alt=""
        />
        <img
          src={toAbsoluteUrl('/media/illustrations/34-dark.svg')}
          className="light:hidden h-20 mb-2"
          alt=""
        />

        <div className="text-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 mb-5">Verify your account</h3>
          <div className="flex flex-col">
            <span className="text-2sm text-gray-700 mb-1.5">
              Enter the verification code we sent to
            </span>
            <a href="#" className="text-sm font-medium text-gray-900">
              {maskEmail(email)}
            </a>
          </div>
        </div>
        {showError && <Alert variant="danger">{error}</Alert>}
        <div className="flex flex-wrap justify-center gap-2.5">
          {codeInputs.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="input focus:border-primary-clarity focus:ring focus:ring-primary-clarity size-10 shrink-0 px-0 text-center"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el)} // Assign the ref to each input
            />
          ))}
        </div>

        <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-gray-700 me-1.5">Didn’t receive a code? ({timeLeft}s)</span>
          <Link
            to="/admin/auth/login"
            className="text-xs link"
            onClick={(e) => e.preventDefault()}
            style={{ pointerEvents: timeLeft > 0 ? 'none' : 'auto' }}
          >
            Resend
          </Link>
        </div>

        <button className="btn btn-primary flex justify-center grow" disabled={isButtonDisabled}>
          {!isLoading ? `Continue` : <span>Please wait...</span>}
        </button>

        <Link
          to="/admin/auth/login"
          className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
        >
          <KeenIcon icon="black-left" />
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export { TwoFactorAuth };
