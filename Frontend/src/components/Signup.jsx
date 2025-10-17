import React, { useState } from "react";
import { signup, verifyOtp, setPassword , rejectVerification} from "../api";
import {useNavigate } from "react-router-dom";
import { Eye, EyeOff , CircleArrowLeft,  X} from "lucide-react";

const steps = [
  "Your details",
  "Check your inbox",
  "Choose a password",
  "Successfully",
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {steps.map((_, idx) => (
        <span
          key={idx}
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${idx === current ? "bg-indigo-600" : "bg-gray-300"
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
  const [ showModal , setShowModal] =useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const navigate = useNavigate();
  // Responsive state
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    otp: ["", "", "", ""],
    password: "",
  });
  
  console.log(fields);

  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
  }
const confirmRejection = async () => {
  setLoading(true);
  try {
    const {email} = fields;
    await rejectVerification({email});
    setStep(0);
    setShowArrow(false);
    setShowModal(false);
  } catch (error) {
    setApiError(error.message || "Failed to reject verification. Please try again.");
  }
  setLoading(false);
};
  
  // Validation
  const validateStep = () => {
    setApiError("");
    if (step === 0) {
      if (!fields.firstName || !fields.lastName || !fields.email || !fields.phone || !fields.username) {
        setApiError("All fields are required.");
        return false;
      }
      if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setApiError("Enter a valid email address.");
        return false;
      }
      
      if(fields.phone.length !== 10)
      {
        setApiError("Enter a valid Phone number");
      }
      return true;
    }
    if (step === 1) {
      if (fields.otp.some((digit) => digit === "")) {
        setApiError("Enter all 4 digits of the OTP.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!fields.password || fields.password.length < 8) {
        setApiError("Password must be at least 8 characters.");
        return false;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(fields.password)) {
        setApiError("Password must have at least one special character.");
        return false;
      }
      if (fields.password !== fields.confirmPassword) {
        setApiError("Passwords do not match.");
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
    } catch (err) {
      setApiError(err.message || "Signup failed. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const otp = fields.otp.join("");
      await verifyOtp({ email: userEmail, otp });
      setStep(2);
    } catch (err) {
      setApiError(err.message || "Invalid OTP. Please try again.");
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
    } catch (err) {
      setApiError(err.message || "Error setting password.");
    }
    setLoading(false);
  };
  
  const handleNavigate = () => {
     setLoading(true);
     navigate('/login')
  }

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step === 0) await handleSignup();
    else if (step === 1) await handleVerifyOtp();
    else if (step === 2) await handleSetPassword();
    else if (step === 3)  handleNavigate();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <aside className="hidden md:flex w-full md:w-1/3 flex-col border-r bg-white p-10 relative">
        <nav className="flex-1 relative">

          <ol className="relative z-10 space-y-10">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4">
                {/* Checkpoint (centered on line) */}
                <div
                  className={`relative z-10 py-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${step >= i ? "bg-indigo-500 scale-110 shadow-md" : "bg-gray-300"
                    }`}
                >
                  {step > i ? (
                    <span className="text-white text-xs font-bold">✓</span>
                  ) : (
                    <span className="text-white text-xs"></span>
                  )}
                </div>

                {/* Step text */}
                <div>
                  <div
                    className={`${step === i
                        ? "text-indigo-600 font-semibold"
                        : "text-gray-400 font-medium"
                      }`}
                  >
                    {s}
                  </div>
                  <div className="text-xs text-gray-400">
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
      <>
      <main className="flex-1 md:w-2/3 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl  text-center shadow p-6 sm:p-8">
          {showArrow && (<CircleArrowLeft onClick={handleBack}/>)}
          {/* Step Contents */}
          {step === 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-2 items-center justify-center">Your details</h2>
              <p className="text-gray-500 mb-6">Welcome! Please set your information.</p>
              <input
                name="firstName"
                type="text"
                placeholder="firstName"
                className="input w-full mt-3 text-lg px-4 py-3 rounded-lg bg-gray-100"
                value={fields.firstName}
                onChange={handleChange}
              />
              <input
                name="lastName"
                type="text"
                placeholder="lastName"
                className="input w-full mt-3 text-lg px-4 py-3 rounded-lg bg-gray-100"
                value={fields.lastName}
                onChange={handleChange}
              />
              <input
                name="username"
                type="text"
                placeholder="Username"
                className="input w-full mt-3 text-lg px-4 py-3 rounded-lg bg-gray-100"
                value={fields.username}
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="input w-full mt-3 text-lg px-4 py-3 rounded-lg bg-gray-100"
                value={fields.email}
                onChange={handleChange}
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone"
                className="input w-full mt-3 text-lg px-4 py-3 rounded-lg bg-gray-100"
                value={fields.phone}
                onChange={handleChange}
              />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-semibold mb-2">Check your inbox</h2>
              <p className="text-gray-500 mb-3">
                We sent a verification code to {userEmail}.
              </p>
              <div className="flex gap-3 justify-center mb-3">
                {fields.otp.map((v, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-2xl font-bold rounded-lg bg-gray-100 text-center border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    value={fields.otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Didn't receive the email?{" "}
                <button type="button" className="text-indigo-500 underline">
                  Resend
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
      <h2 className="text-2xl font-semibold mb-2">Set a password</h2>
      <p className="text-gray-500 mb-6">
        Please set a strong password for your account.
      </p>

      {/* Password input */}
      <div className="relative w-full">
        <input
          name="password"
          type={showPassword ? "text" : "password"} // dots when hidden
          placeholder="Password"
          className="input w-full text-xl px-4 py-3 rounded-lg bg-gray-100 pr-12"
          value={fields.password}
          onChange={handleChange}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword(prev => !prev)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      {/* Confirm password input */}
      <div className="relative w-full mt-3">
        <input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"} // dots when hidden
          placeholder="Confirm password"
          className="input w-full text-xl px-4 py-3 rounded-lg bg-gray-100 pr-12"
          value={fields.confirmPassword}
          onChange={handleChange}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => setShowConfirmPassword(prev => !prev)}
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      <ul className="mt-2 text-xs text-gray-500 text-left list-inside list-disc">
        <li>Must be at least 8 characters</li>
        <li>Must contain one special character</li>
      </ul>
    </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-semibold mb-2">Successfully</h2>
              <p className="text-gray-500 mb-6">
                Your account has been successfully created.<br />
                Click below to log in magically.
              </p>
            </>
          )}
          {apiError && (
            <div className="text-red-500 text-sm text-left mb-2 mt-2">{apiError}</div>
          )}
          <button
            className={`mt-8 w-full py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg ${loading && "opacity-60 cursor-not-allowed"
              }`}
            disabled={loading || step === 3}
            onClick={handleNext}
          >
            {step === 0 && "Continue"}
            {step === 1 && "Verify email"}
            {step === 2 && "Reset password"}
            {step === 3 && "Continue"}
          </button>
          <StepIndicator current={step} />
          <div className="mt-3 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 underline">Sign in</a>
          </div>
        </div>
      </main>
        <ConfirmationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={confirmRejection}
        />
      </>
    </div>
  );
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message = "Are you sure you want to reject the signup?",
  title = "Confirm Rejection"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-base-100 rounded-3xl shadow-2xl border-2 border-base-300 w-full max-w-md max-h-[94vh] overflow-hidden animate-in zoom-in duration-300 scale-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b-2 border-base-300 bg-gradient-to-r from-base-200 to-base-300">
          <h2 className="text-2xl font-bold text-base-content leading-tight">{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error border-2 border-transparent hover:border-error/30 transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={20} className="text-base-content/70" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-6">
          <p className="text-base-content">{message}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-error"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-primary/5 to-secondary/5 -z-10" />
      </div>
    </div>
  );
};
