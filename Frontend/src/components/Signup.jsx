import React, { useState } from "react";
import { signup, verifyOtp, setPassword, rejectVerification } from "../api";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CircleArrowLeft, X } from "lucide-react";
import { useToast } from '../context/useToast';

const steps = [
  "Your details",
  "Check your inbox",
  "Choose a password",
  "Successfully",
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4 sm:mt-6">
      {steps.map((_, idx) => (
        <span
          key={idx}
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
            idx === current ? "bg-indigo-600" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function SignupFlow() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    otp: ["", "", "", ""],
    password: "",
    confirmPassword: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (idx, value) => {
    if (/^[0-9]{0,1}$/.test(value)) {
      const otp = [...fields.otp];
      otp[idx] = value;
      setFields({ ...fields, otp });

      // Auto focus next/prev
      if (value && idx < 3)
        document.getElementById(`otp-${idx + 1}`).focus();
      if (!value && idx > 0)
        document.getElementById(`otp-${idx - 1}`).focus();
    }
  };

  const handleBack = () => {
    setShowModal(true);
  };

  const confirmRejection = async () => {
    setLoading(true);
    try {
      const { email } = fields;
      await rejectVerification({ email });
      setStep(0);
      setShowArrow(false);
      setShowModal(false);
      setFields({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        username: "",
        otp: ["", "", "", ""],
        password: "",
        confirmPassword: "",
      });
      showToast('Signup process cancelled successfully', 'info');
    } catch (error) {
      const errorMessage = error.message || "Failed to reject verification. Please try again.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  // Validation
  const validateStep = () => {
    if (step === 0) {
      if (!fields.firstName || !fields.lastName || !fields.email || !fields.phone || !fields.username) {
        const errorMessage = "All fields are required.";
        showToast(errorMessage, 'error');
        return false;
      }
      if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        const errorMessage = "Enter a valid email address.";
        showToast(errorMessage, 'error');
        return false;
      }
      
      if (fields.phone.length !== 10) {
        const errorMessage = "Enter a valid Phone number";
        showToast(errorMessage, 'error');
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (fields.otp.some((digit) => digit === "")) {
        const errorMessage = "Enter all 4 digits of the OTP.";
        showToast(errorMessage, 'error');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!fields.password || fields.password.length < 8) {
        const errorMessage = "Password must be at least 8 characters.";
        showToast(errorMessage, 'error');
        return false;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(fields.password)) {
        const errorMessage = "Password must have at least one special character.";
        showToast(errorMessage, 'error');
        return false;
      }
      if (fields.password !== fields.confirmPassword) {
        const errorMessage = "Passwords do not match.";
        showToast(errorMessage, 'error');
        return false;
      }
      return true;
    }
    return true;
  };

  // API Submit Handlers
  const handleSignup = async () => {
    setLoading(true);
    try {
      const { firstName, lastName, email, phone, username } = fields;
      await signup({ firstName, lastName, email, phone, username });
      setUserEmail(email);
      setStep(1);
      setShowArrow(true);
      showToast('Verification code sent to your email!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Signup failed. Please try again.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const otp = fields.otp.join("");
      await verifyOtp({ email: userEmail, otp });
      setStep(2);
      showToast('Email verified successfully!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Invalid OTP. Please try again.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleSetPassword = async () => {
    setLoading(true);
    try {
      await setPassword({
        email: userEmail,
        password: fields.password,
      });
      setStep(3);
      showToast('Password set successfully! Account created!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Error setting password.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleNavigate = () => {
    showToast('Redirecting to login...', 'info');
    navigate('/login');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { firstName, lastName, email, phone, username } = fields;
      await signup({ firstName, lastName, email, phone, username });
      showToast('Verification code resent to your email!', 'success');
    } catch (err) {
      const errorMessage = err.message || "Failed to resend OTP. Please try again.";
      showToast(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    if (step === 0) await handleSignup();
    else if (step === 1) await handleVerifyOtp();
    else if (step === 2) await handleSetPassword();
    else if (step === 3) handleNavigate();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex w-full md:w-1/3 lg:w-2/5 flex-col border-r bg-white p-6 lg:p-10 relative">
        <nav className="flex-1 relative">
          <ol className="relative z-10 space-y-8 lg:space-y-10">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4">
                {/* Checkpoint */}
                <div
                  className={`relative z-10 py-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step >= i ? "bg-indigo-500 scale-110 shadow-md" : "bg-gray-300"
                  }`}
                >
                  {step > i ? (
                    <span className="text-white text-xs font-bold">✓</span>
                  ) : (
                    <span className="text-white text-xs"></span>
                  )}
                </div>

                {/* Step text */}
                <div className="flex-1">
                  <div
                    className={`text-sm lg:text-base ${
                      step === i
                        ? "text-indigo-600 font-semibold"
                        : "text-gray-400 font-medium"
                    }`}
                  >
                    {s}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {i === 0 && "Please provide your details information."}
                    {i === 1 && "Verify codes delivered to your inbox."}
                    {i === 2 && "Choose a secure password."}
                    {i === 3 && "Go back to log in into your account."}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full md:w-2/3 lg:w-3/5 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md bg-white rounded-2xl text-center shadow-sm sm:shadow p-4 sm:p-6 md:p-8">
          {/* Back Arrow */}
          {showArrow && (
            <div className="flex justify-start mb-4">
              <CircleArrowLeft 
                onClick={handleBack}
                className="cursor-pointer text-gray-600 hover:text-indigo-600 transition-colors"
                size={24}
              />
            </div>
          )}

          {/* Step Contents */}
          {step === 0 && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Your details</h2>
              <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                Welcome! Please set your information.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <input
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none"
                  value={fields.firstName}
                  onChange={handleChange}
                />
                <input
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none"
                  value={fields.lastName}
                  onChange={handleChange}
                />
                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none"
                  value={fields.username}
                  onChange={handleChange}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none"
                  value={fields.email}
                  onChange={handleChange}
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none"
                  value={fields.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                We sent a verification code to {userEmail}.
              </p>
              <div className="flex gap-2 sm:gap-3 justify-center mb-4">
                {fields.otp.map((v, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-2xl font-bold rounded-lg bg-gray-100 text-center border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={fields.otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400">
                Didn't receive the email?{" "}
                <button 
                  type="button" 
                  className="text-indigo-500 underline"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend"}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Set a password</h2>
              <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                Please set a strong password for your account.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {/* Password input */}
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none pr-12"
                    value={fields.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm password input */}
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full text-sm sm:text-base px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white outline-none pr-12"
                    value={fields.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <ul className="mt-3 text-xs text-gray-500 text-left space-y-1">
                <li>• Must be at least 8 characters</li>
                <li>• Must contain one special character</li>
              </ul>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Successfully</h2>
              <p className="text-gray-500 text-sm sm:text-base mb-6">
                Your account has been successfully created.<br />
                Click below to log in magically.
              </p>
            </>
          )}

          {/* Continue Button */}
          <button
            className={`mt-6 w-full py-3 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
            disabled={loading}
            onClick={handleNext}
          >
            {loading ? "Processing..." : 
             step === 0 ? "Continue" :
             step === 1 ? "Verify email" :
             step === 2 ? "Set password" :
             "Go to Login"}
          </button>

          <StepIndicator current={step} />

          <div className="mt-4 text-center text-xs sm:text-sm text-gray-400">
            Already have an account?{" "}
            <button 
              onClick={() => {
                showToast('Redirecting to login...', 'info');
                navigate('/login');
              }}
              className="text-indigo-600 underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmRejection}
        loading={loading}
      />
    </div>
  );
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  message = "Are you sure you want to cancel the signup?",
  title = "Confirm Cancellation"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[94vh] overflow-hidden animate-in zoom-in duration-300 scale-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
            disabled={loading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};