import React from 'react';
import ReactDOM from 'react-dom/client';
import { redirect, createBrowserRouter, RouterProvider } from 'react-router-dom';

import Root from './components/LogIn';
import SignUp from './components/student/SignUp';

import StudentHomepage from './components/student/StudentHomepage';
import PdfModal from './components/modal/PdfModal';

import AdminRoot from './components/admin/AdminRoot'
import ApproverList from './components/admin/ApproverList';
import StudentApplications from './components/admin/StudentApplications';
import ApproverHomepage from './components/approver/ApproverHomepage';

// Send a POST request to API to check if the user is logged in. Redirect the user to /student-homepage if already logged in
const checkIfLoggedInOnHome = async () => {
  const res = await fetch("http://localhost:3001/checkifloggedin", 
  {
    method: "POST",
    credentials: "include"
  });

  const { isLoggedIn, userType } = await res.json();

  if (isLoggedIn) {
    if (userType == "student") return redirect("/student")
    else if (userType == "approver") return redirect ("/approver")
    else return redirect ("/admin")
  }
  else return 0;
};

// Send a POST request to API to check if the user is logged in. Redirect the user back to / if not logged in
const checkIfLoggedInAsStudent = async () => {
  const res = await fetch("http://localhost:3001/checkifloggedin", 
  {
    method: "POST",
    credentials: "include"
  });

  const { isLoggedIn, userType } = await res.json();

  if (isLoggedIn && userType == "student") return true;
  else return redirect("/");
};

const checkIfLoggedInAsAdmin = async () => {
  const res = await fetch("http://localhost:3001/checkifloggedin", 
  {
    method: "POST",
    credentials: "include"
  });

  const { isLoggedIn, userType } = await res.json();

  if (isLoggedIn && userType == "admin") return true;
  else return redirect("/");
};

const checkIfLoggedInAsApprover = async () => {
  const res = await fetch("http://localhost:3001/checkifloggedin", 
  {
    method: "POST",
    credentials: "include"
  });

  const { isLoggedIn, userType } = await res.json();

  if (isLoggedIn && userType == "approver") return true;
  else return redirect("/");
};

// create a router that has all the routes defined. loader is called before the route is rendered
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    loader: checkIfLoggedInOnHome
  },
  {
    path: '/sign-up',
    element: <SignUp />,
    loader: checkIfLoggedInOnHome
  },
  {
    path: '/admin',
    element: <AdminRoot />,
    children: [
      {
        path: '/admin',
        element: <StudentApplications />
      },
      {
        path: '/admin/manage-approvers',
        element: <ApproverList />
      }
    ],
    loader: checkIfLoggedInAsAdmin
  },
  {
    path: '/approver',
    element: <ApproverHomepage/>,
    loader: checkIfLoggedInAsApprover
  },
  {
    path: '/student',
    element: <StudentHomepage />,
    loader: checkIfLoggedInAsStudent
  },
  {
    path: '/approver-list',
    element: <ApproverList />,
  },
  {
    path: '/pdf-modal',
    element: <PdfModal />
  },
]);

// render the router to the page
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);