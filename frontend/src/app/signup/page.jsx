'use client';
import axios from 'axios';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';




const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Password is required')
    .matches(/[a-z]/, 'lowercase letter is required')
    .matches(/[A-Z]/, 'uppercase letter is required')
    .matches(/[0-9]/, 'number is required')
      .matches(/[^A-Za-z0-9]/, 'special character is required')
    .min(8, 'must contain atleast 8 characters'),
  confirmPassword: Yup.string().required('confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  terms: Yup.boolean().oneOf([true], 'You must accept the terms')
});

const Signup = () => {
  
  const router = useRouter();

  const signupForm = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    },
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const { confirmPassword, terms, ...userData } = values;
        await axios.post('http://localhost:5000/user/add', userData);
        resetForm();
        toast.success('User registered successfully');
        router.push('/login');
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Something went wrong');
      } finally {
        setSubmitting(false);
      }
    },
    validationSchema: SignupSchema,
    validateOnBlur: true
  });

  return (
    <div>
      <main
        className="
min-h-screen
bg-slate-950
flex
items-center
justify-center
px-4
py-8
relative
overflow-hidden
    "
      >
        {/* =========================================================
   BACKGROUND DECORATION
    ========================================================== */}
        <div
          className="
  absolute
  -top-32
  -left-32
  w-96
  h-96
  bg-violet-600/20
  rounded-full
  blur-3xl
"
        />
        <div
          className="
  absolute
  -bottom-32
  -right-32
  w-96
  h-96
  bg-blue-600/20
  rounded-full
  blur-3xl
"
        />
        {/* =========================================================
   SIGNUP CARD
    ========================================================== */}
        <section
          className="
  relative
  z-10
  w-full
  max-w-6xl
  grid
  grid-cols-1
  lg:grid-cols-2
  overflow-hidden
  rounded-3xl
  border
  border-white/10
  bg-white dark:bg-slate-900/5
  backdrop-blur-xl
  shadow-2xl
"
        >
          {/* =======================================================
     LEFT SIDE
======================================================== */}
          <div
            className="
    hidden
    lg:flex
    flex-col
    justify-between
    p-12
    xl:p-16
    bg-gradient-to-br
    from-purple-900
    via-indigo-800
    to-blue-900/50
  "
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="
        w-11
        h-11
        rounded-xl
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-violet-500
        to-blue-500
        text-white
        text-xl
        font-bold
        shadow-lg
        shadow-violet-500/20
      "
              >
                A
              </div>
              <span
                className="
        text-xl
        font-bold
        text-white
      "
              >

              </span>
            </div>
            {/* Hero Content */}
            <div className="my-16">
              <span
                className="
        inline-flex
        items-center
        gap-2
        px-4
        py-2
        rounded-full
        bg-white dark:bg-slate-900/10
        border
        border-white/10
        text-violet-200
        text-sm
        font-medium
      "
              >
                ✨ Welcome to our platform
              </span>
              <h1
                className="
        mt-6
        text-4xl
        xl:text-5xl
        font-extrabold
        leading-tight
        tracking-tight
        text-white
      "
              >
                Create your account
                <span
                  className="
          block
          text-violet-400
        "
                >
                  and start building.
                </span>
              </h1>
              <p
                className="
        mt-6
        max-w-lg
        text-base
        leading-7
        text-slate-300
      "
              >
                Join our growing community and get access to powerful tools designed
                to help you achieve more.
              </p>
              {/* Features */}
              <div className="mt-10 space-y-5">
                {/* Feature 1 */}
                <div className="flex items-center gap-4">
                  <div
                    className="
            w-9
            h-9
            shrink-0
            rounded-full
            bg-violet-500/20
            border
            border-violet-400/20
            flex
            items-center
            justify-center
            text-violet-300
            font-bold
          "
                  >
                    ✓
                  </div>
                  <div>
                    <h3
                      className="
              text-sm
              font-semibold
              text-white
            "
                    >
                      Simple &amp; Easy
                    </h3>
                    <p
                      className="
              mt-1
              text-xs
              text-slate-400
            "
                    >
                      Clean and easy-to-use experience.
                    </p>
                  </div>
                </div>
                {/* Feature 2 */}
                <div className="flex items-center gap-4">
                  <div
                    className="
            w-9
            h-9
            shrink-0
            rounded-full
            bg-violet-500/20
            border
            border-violet-400/20
            flex
            items-center
            justify-center
            text-violet-300
            font-bold
          "
                  >
                    ✓
                  </div>
                  <div>
                    <h3
                      className="
              text-sm
              font-semibold
              text-white
            "
                    >
                      Secure &amp; Private
                    </h3>
                    <p
                      className="
              mt-1
              text-xs
              text-slate-400
            "
                    >
                      Your information stays protected.
                    </p>
                  </div>
                </div>
                {/* Feature 3 */}
                <div className="flex items-center gap-4">
                  <div
                    className="
            w-9
            h-9
            shrink-0
            rounded-full
            bg-violet-500/20
            border
            border-violet-400/20
            flex
            items-center
            justify-center
            text-violet-300
            font-bold
          "
                  >
                    ✓
                  </div>
                  <div>
                    <h3
                      className="
              text-sm
              font-semibold
              text-white
            "
                    >
                      Free to Get Started
                    </h3>
                    <p
                      className="
              mt-1
              text-xs
              text-slate-400
            "
                    >
                      Create your account in seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Copyright */}
            <p className="text-xs text-slate-500">

            </p>
          </div>
          {/* =======================================================
     RIGHT SIDE — FORM
======================================================== */}
          <div
            className="
    bg-white dark:bg-slate-900
    px-6
    py-10
    sm:px-10
    lg:px-12
    xl:px-16
  "
          >
            <div
              className="
      w-full
      max-w-md
      mx-auto
    "
            >
              {/* ===================================================
         MOBILE LOGO
    ==================================================== */}
              <div
                className="
        flex
        lg:hidden
        items-center
        justify-center
        gap-3
        mb-8
      "
              >
                <div
                  className="
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          bg-gradient-to-br
          from-violet-500
          to-blue-500
          text-white
          font-bold
          text-lg
        "
                >
                  A
                </div>
                <span
                  className="
          text-lg
          font-bold
          text-slate-900 dark:text-white
        "
                >
                  AppName
                </span>
              </div>
              {/* ===================================================
         FORM HEADING
    ==================================================== */}
              <div className="text-center lg:text-left">
                <h2
                  className="
          text-3xl
          font-extrabold
          tracking-tight
          text-slate-900 dark:text-white
        "
                >
                  Create Account
                </h2>
                <p
                  className="
          mt-2
          text-sm
          leading-6
          text-slate-500
        "
                >
                  Enter your details to create your account.
                </p>
              </div>
              {/* ===================================================
         SUCCESS / ERROR MESSAGE
    ==================================================== */}
              <div
                id="message"
                className="
        hidden
        mt-6
        rounded-xl
        px-4
        py-3
        text-sm
        font-medium
      "
              />
              {/* ===================================================
         SIGNUP FORM
    ==================================================== */}
              <form
                onSubmit={signupForm.handleSubmit}
                id="signupForm"
                className="
        mt-8
        space-y-5
      "
              >
                {/* =================================================
           FULL NAME
      ================================================== */}
                <div>
                  <label
                    htmlFor="name"
                    className="
            block
            mb-2
            text-sm
            font-semibold
            text-slate-700
          "
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    onChange={signupForm.handleChange}
                    onBlur={signupForm.handleBlur}
                    value={signupForm.values.name}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required=""
                    className="w-full
            h-12
            px-4
            rounded-xl
            border
            border-slate-200 dark:border-slate-700
            bg-slate-50
            text-sm
            text-slate-900 dark:text-white
            placeholder:text-slate-400
            outline-none
            transition
            focus:bg-white dark:bg-slate-900
            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-500/10
          "
                  />
                  {signupForm.touched.name && signupForm.errors.name && (
                    <p className="mt-1 text-xs text-red-600">{signupForm.errors.name}</p>
                  )}
                </div>
                {/* =================================================
           EMAIL
      ================================================== */}
                <div>
                  <label
                    htmlFor="email"
                    className="
            block
            mb-2
            text-sm
            font-semibold
            text-slate-700
          "
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    onChange={signupForm.handleChange}
                    onBlur={signupForm.handleBlur}
                    value={signupForm.values.email}
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required=""
                    className="
            w-full
            h-12
            px-4
            rounded-xl
            border
            border-slate-200 dark:border-slate-700
            bg-slate-50
            text-sm
            text-slate-900 dark:text-white
            placeholder:text-slate-400
            outline-none
            transition
            focus:bg-white dark:bg-slate-900
            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-500/10
          "
                  />
                  {signupForm.touched.email && signupForm.errors.email && (
                    <p className="mt-1 text-xs text-red-600">{signupForm.errors.email}</p>
                  )}
                </div>
                {/* =================================================
           PASSWORD
      ================================================== */}
                <div>
                  <label
                    htmlFor="password"
                    className="
            block
            mb-2
            text-sm
            font-semibold
            text-slate-700
          "
                  >
                    Password
                  </label>
                  {/* Password wrapper */}
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      onChange={signupForm.handleChange}
                      onBlur={signupForm.handleBlur}
                      value={signupForm.values.password}
                      name="password"
                      placeholder="Create a password"
                      autoComplete="new-password"
                      minLength={8}
                      required=""
                      className="
              w-full
              h-12
              px-4
              pr-20
              rounded-xl
              border
              border-slate-200 dark:border-slate-700
              bg-slate-50
              text-sm
              text-slate-900 dark:text-white
              placeholder:text-slate-400
              outline-none
              transition
              focus:bg-white dark:bg-slate-900
              focus:border-violet-500
              focus:ring-4
              focus:ring-violet-500/10
            "
                    />
                    {/* Show Password */}
                    <button
                      type="button"
                      id="togglePassword"
                      onChange={signupForm.handleChange}
                      value={signupForm.values.password}
                      className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-xs
              font-semibold
              text-violet-600
              hover:text-violet-800
            "
                    >
                      Show
                    </button>
                  </div>
                  {/* Password Strength */}
                  <div className="mt-3">
                    <div
                      className="
              h-1.5
              w-full
              rounded-full
              bg-slate-200
              overflow-hidden
            "
                    >
                      <div
                        id="strengthBar"
                        className="
                h-full
                w-0
                rounded-full
                transition-all
                duration-300
              "
                      />
                    </div>
                    <p
                      id="strengthText"
                      className="
              mt-2
              text-xs
              text-slate-400
            "
                    >
                      Use at least 8 characters.
                    </p>
                  </div>
                  {signupForm.touched.password && signupForm.errors.password && (
                    <p className="mt-1 text-xs text-red-600">{signupForm.errors.password}</p>
                  )}
                </div>
                {/* =================================================
           CONFIRM PASSWORD
      ================================================== */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="
            block
            mb-2
            text-sm
            font-semibold
            text-slate-700
          "
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      onChange={signupForm.handleChange}
                      onBlur={signupForm.handleBlur}
                      value={signupForm.values.confirmPassword}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required=""
                      className="
              w-full
              h-12
              px-4
              pr-20
              rounded-xl
              border
              border-slate-200 dark:border-slate-700
              bg-slate-50
              text-sm
              text-slate-900 dark:text-white
              placeholder:text-slate-400
              outline-none
              transition
              focus:bg-white dark:bg-slate-900
              focus:border-violet-500
              focus:ring-4
              focus:ring-violet-500/10
            "
                    />
                    <button
                      type="button"
                      id="toggleConfirmPassword"
                      className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-xs
              font-semibold
              text-violet-600
              hover:text-violet-800
            "
                    >
                      Show
                    </button>
                  </div>
                  <p
                    id="passwordMatch"
                    onChange={signupForm.handleChange}
                    value={signupForm.values.passwordMatch}
                    className="
            mt-2
            text-xs
            hidden
          "
                  />
                  {signupForm.touched.confirmPassword && signupForm.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{signupForm.errors.confirmPassword}</p>
                  )}
                </div>
                {/* =================================================
           TERMS
      ================================================== */}
                <div
                  className="
          flex
          items-start
          gap-3
        "
                >
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={signupForm.values.terms}
                    onChange={signupForm.handleChange}
                    onBlur={signupForm.handleBlur}
                    required=""
                    className="
            mt-1
            w-4
            h-4
            accent-violet-600
            cursor-pointer
          "
                  />
                  <label
                    htmlFor="terms"
                    className="
            text-xs
            leading-5
            text-slate-500
            cursor-pointer
          "
                  >
                    I agree to the
                    <a
                      href="#"
                      className="
              font-semibold
              text-violet-600
              hover:text-violet-700
            "
                    >
                      Terms &amp; Conditions
                    </a>
                    and
                    <a
                      href="#"
                      className="
              font-semibold
              text-violet-600
              hover:text-violet-700
            "
                    >
                      Privacy Policy
                    </a>
                  </label>
                  {signupForm.touched.terms && signupForm.errors.terms && (
                    <p className="text-xs text-red-600">{signupForm.errors.terms}</p>
                  )}
                </div>
                {/* =================================================
           CREATE ACCOUNT BUTTON
      ================================================== */}
                <button
                  type="submit"
                  id="submitButton"
                  disabled={signupForm.isSubmitting}
                  className="
          w-full
          h-12
          rounded-xl
          bg-gradient-to-r
          from-violet-600
          to-indigo-600
          text-white
          text-sm
          font-bold
          shadow-lg
          shadow-violet-600/20
          transition
          duration-200
          hover:from-violet-500
          hover:to-indigo-500
          hover:-translate-y-0.5
          active:scale-[0.98]
        "
                >
                  Create Account
                </button>
              </form>
              {/* ===================================================
         DIVIDER
    ==================================================== */}
              <div
                className="
        flex
        items-center
        gap-4
        my-6
      "
              >
                <div
                  className="
          flex-1
          h-px
          bg-slate-200
        "
                />
                <span
                  className="
          text-[10px]
          font-bold
          tracking-widest
          text-slate-400
        "
                >
                  OR
                </span>
                <div
                  className="
          flex-1
          h-px
          bg-slate-200
        "
                />
              </div>
              {/* ===================================================
         SOCIAL BUTTONS
    ==================================================== */}
              <div
                className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-3
      "
              >
                {/* Google */}
                <button
                  type="button"
                  id="googleButton"
                  onChange={signupForm.handleChange}
                  value={signupForm.values.googleButton}
                  className="
          h-11
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          text-sm
          font-semibold
          text-slate-700
          transition
          hover:bg-slate-50
          hover:border-slate-300
        "
                >
                  <span
                    className="
            text-base
            font-bold
            text-blue-500
          "
                  >
                    G
                  </span>
                  Google
                </button>
                {/* GitHub */}
                <button
                  type="button"
                  id="githubButton"
                  onChange={signupForm.handleChange}
                  value={signupForm.values.githubButton}
                  className="
          h-11
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          text-sm
          font-semibold
          text-slate-700
          transition
          hover:bg-slate-50
          hover:border-slate-300
        "
                >
                  <span
                    className="
            text-base
            font-bold
            text-slate-900 dark:text-white
          "
                  >
                    Git
                  </span>
                  GitHub
                </button>
              </div>
              {/* ===================================================
         LOGIN
    ==================================================== */}
              <p
                className="
        mt-7
        text-center
        text-sm
        text-slate-500
      "
              >
                Already have an account?
                <a
                  href="/login"
                  className="
          ml-1
          font-bold
          text-violet-600
          hover:text-violet-700
        "
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      {/* =========================================================
 JAVASCRIPT
  ========================================================== */}



    </div>
  );
};

export default Signup;
