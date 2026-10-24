"use client";

import { useAppContext } from "@/components/AppProvider";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";

// =====================================================
// LOGIN VALIDATION
// =====================================================

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),

  password: Yup.string()
    .required("Password is required"),
});

// =====================================================
// LOGIN COMPONENT
// =====================================================

const Login = () => {
  const router = useRouter();

  const { setLoggedIn } = useAppContext();

  // ===================================================
  // FORMIK
  // ===================================================

  const loginForm = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },

    validationSchema: LoginSchema,

    // =================================================
    // LOGIN SUBMIT
    // =================================================

    onSubmit: async (values, { setSubmitting }) => {
      try {
        // ---------------------------------------------
        // 1. REMOVE remember FROM API REQUEST
        // ---------------------------------------------

        const { remember, ...credentials } = values;

        // ---------------------------------------------
        // 2. CALL BACKEND LOGIN API
        // ---------------------------------------------

        const response = await axios.post(
          "http://localhost:5000/user/authenticate",
          credentials
        );

        // ---------------------------------------------
        // 3. CHECK BACKEND RESPONSE
        // ---------------------------------------------

        if (!response.data.success) {
          toast.error(
            response.data.message || "Login failed"
          );

          return;
        }

        // ---------------------------------------------
        // 4. SELECT STORAGE
        // ---------------------------------------------

        const storage = remember
          ? localStorage
          : sessionStorage;

        // ---------------------------------------------
        // 5. SAVE JWT TOKEN
        // ---------------------------------------------

        storage.setItem(
          "token",
          response.data.token
        );

        // ---------------------------------------------
        // 6. SAVE LOGGED-IN STUDENT
        // ---------------------------------------------

        storage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        // ---------------------------------------------
        // 7. REMOVE OLD USER DATA
        // FROM OTHER STORAGE
        // ---------------------------------------------

        if (remember) {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }

        // ---------------------------------------------
        // 8. SUCCESS MESSAGE
        // ---------------------------------------------

        toast.success("Login successful!");
        setLoggedIn(true);

        // ---------------------------------------------
        // 9. GO TO DASHBOARD
        // ---------------------------------------------

        router.push("/dashboard");

      } catch (error) {
        // ---------------------------------------------
        // ERROR HANDLING
        // ---------------------------------------------

        console.log("Login Error:", error);

        toast.error(
          error.response?.data?.message ||
          "Invalid email or password"
        );

      } finally {
        // ---------------------------------------------
        // STOP LOADING
        // ---------------------------------------------

        setSubmitting(false);
      }
    },
  });

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        dark:bg-slate-950
        flex
        items-center
        justify-center
        px-4
        py-8
        relative
        overflow-hidden
        transition-colors
        duration-300
      "
    >

      {/* =================================================
          BACKGROUND GLOW
      ================================================== */}

      <div
        className="
          absolute
          -top-40
          -left-40
          w-[450px]
          h-[450px]
          rounded-full
          bg-violet-500/10
          dark:bg-violet-600/20
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -bottom-40
          -right-40
          w-[450px]
          h-[450px]
          rounded-full
          bg-blue-500/10
          dark:bg-blue-600/20
          blur-3xl
          pointer-events-none
        "
      />

      {/* =================================================
          LOGIN CARD
      ================================================== */}

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
          border-slate-200
          dark:border-white/10
          bg-white
          dark:bg-slate-900
          shadow-2xl
        "
      >

        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <div
          className="
            hidden
            lg:flex
            flex-col
            justify-between
            p-12
            xl:p-16
            bg-gradient-to-br
            from-violet-600
            via-indigo-600
            to-blue-600
          "
        >

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                bg-white/15
                border
                border-white/20
                text-white
                text-xl
                font-extrabold
                shadow-lg
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
              ANP
            </span>

          </div>

          {/* LEFT CONTENT */}

          <div className="my-16">

            {/* BADGE */}

            <span
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                bg-white/10
                border
                border-white/20
                text-violet-100
                text-sm
                font-medium
              "
            >
              <span>●</span>
              Welcome Back
            </span>

            {/* HEADING */}

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
              Welcome back.

              <span
                className="
                  block
                  text-violet-200
                "
              >
                Let's continue.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                max-w-lg
                text-base
                leading-7
                text-indigo-100
              "
            >
              Sign in to connect with alumni, discover
              career opportunities, find mentors and
              build meaningful professional relationships.
            </p>

            {/* FEATURES */}

            <div className="mt-10 space-y-5">

              {/* FEATURE 1 */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-9
                    h-9
                    shrink-0
                    rounded-full
                    bg-white/10
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    text-white
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
                    Secure Login
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-indigo-100
                    "
                  >
                    Your account stays safe and protected.
                  </p>

                </div>

              </div>

              {/* FEATURE 2 */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-9
                    h-9
                    shrink-0
                    rounded-full
                    bg-white/10
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    text-white
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
                    Fast & Reliable
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-indigo-100
                    "
                  >
                    Quick access whenever you need it.
                  </p>

                </div>

              </div>

              {/* FEATURE 3 */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-9
                    h-9
                    shrink-0
                    rounded-full
                    bg-white/10
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    text-white
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
                    Alumni & Student Network
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-indigo-100
                    "
                  >
                    Connect and grow your professional network.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* LEFT FOOTER */}

          <p
            className="
              text-xs
              text-indigo-100/70
            "
          >
            Alumni Student Networking Portal
          </p>

        </div>

        {/* =================================================
            RIGHT SIDE - LOGIN FORM
        ================================================== */}

        <div
          className="
            bg-white
            dark:bg-slate-900
            px-6
            py-10
            sm:px-10
            lg:px-12
            xl:px-16
          "
        >

          <div className="w-full max-w-md mx-auto">

            {/* =================================================
                MOBILE LOGO
            ================================================== */}

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
                  text-slate-900
                  dark:text-white
                "
              >
                ANP
              </span>

            </div>

            {/* =================================================
                FORM HEADER
            ================================================== */}

            <div
              className="
                text-center
                lg:text-left
              "
            >

              <h2
                className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Sign in
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Enter your credentials to access your account.
              </p>

            </div>

            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={loginForm.handleSubmit}
              className="
                mt-8
                space-y-5
              "
            >

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
                    dark:text-slate-200
                  "
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginForm.values.email}
                  onChange={loginForm.handleChange}
                  onBlur={loginForm.handleBlur}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-800
                    text-sm
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-violet-500
                    focus:ring-4
                    focus:ring-violet-500/10
                  "
                />

                {loginForm.touched.email &&
                  loginForm.errors.email && (
                    <p
                      className="
                        mt-1
                        text-xs
                        text-red-600
                        dark:text-red-400
                      "
                    >
                      {loginForm.errors.email}
                    </p>
                  )}

              </div>

              {/* =================================================
                  PASSWORD
              ================================================== */}

              <div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-2
                  "
                >

                  <label
                    htmlFor="password"
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      toast("Forgot password feature coming soon")
                    }
                    className="
                      text-xs
                      font-semibold
                      text-violet-600
                      hover:text-violet-700
                    "
                  >
                    Forgot Password?
                  </button>

                </div>

                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginForm.values.password}
                  onChange={loginForm.handleChange}
                  onBlur={loginForm.handleBlur}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-800
                    text-sm
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-violet-500
                    focus:ring-4
                    focus:ring-violet-500/10
                  "
                />

                {loginForm.touched.password &&
                  loginForm.errors.password && (
                    <p
                      className="
                        mt-1
                        text-xs
                        text-red-600
                        dark:text-red-400
                      "
                    >
                      {loginForm.errors.password}
                    </p>
                  )}

              </div>

              {/* =================================================
                  REMEMBER ME
              ================================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={loginForm.values.remember}
                  onChange={loginForm.handleChange}
                  onBlur={loginForm.handleBlur}
                  className="
                    w-4
                    h-4
                    accent-violet-600
                    cursor-pointer
                  "
                />

                <label
                  htmlFor="remember"
                  className="
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                    cursor-pointer
                  "
                >
                  Remember me for 30 days
                </label>

              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={loginForm.isSubmitting}
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
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loginForm.isSubmitting
                  ? "Signing In..."
                  : "Sign In"}
              </button>

            </form>

            {/* =================================================
                DIVIDER
            ================================================== */}

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
                  dark:bg-slate-700
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
                OR CONTINUE WITH
              </span>

              <div
                className="
                  flex-1
                  h-px
                  bg-slate-200
                  dark:bg-slate-700
                "
              />

            </div>

            {/* =================================================
                SOCIAL LOGIN
            ================================================== */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
              "
            >

              {/* GOOGLE */}

              <button
                type="button"
                onClick={() =>
                  toast("Google login will be added later")
                }
                className="
                  h-11
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                  transition
                  hover:bg-slate-50
                  dark:hover:bg-slate-700
                "
              >

                <span
                  className="
                    text-base
                    font-extrabold
                    text-blue-500
                  "
                >
                  G
                </span>

                Google

              </button>

              {/* GITHUB */}

              <button
                type="button"
                onClick={() =>
                  toast("GitHub login will be added later")
                }
                className="
                  h-11
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                  transition
                  hover:bg-slate-50
                  dark:hover:bg-slate-700
                "
              >

                <span
                  className="
                    text-sm
                    font-extrabold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Git
                </span>

                GitHub

              </button>

            </div>

            {/* =================================================
                SIGNUP LINK
            ================================================== */}

            <p
              className="
                mt-7
                text-center
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Don't have an account?

              <a
                href="/signup"
                className="
                  ml-1
                  font-bold
                  text-violet-600
                  hover:text-violet-700
                "
              >
                Create Account
              </a>

            </p>

          </div>

        </div>

      </section>

    </main>
  );
};

export default Login;