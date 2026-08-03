import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer, // Dashboard
  cilImage,       // Banner & Images
  cilText,        // Testimonial & Blogs
  cilUser,        // All User
  cilGroup,       // All Provider
  cilChatBubble,  // All Chat
  cilWallet,      // Withdraw Request
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'User',
    to: '/user/all-user',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Advocate',
    to: '/advocate/all-advocates',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Admin Time Slots',
    to: '/admin/all-time-slots',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Meetings',
    to: '/meetings/all-meetings',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Create Meeting',
    to: '/meetings/create-meeting',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Demo Meetings',
    to: '/meetings/all-demo-meetings',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Contact Enquiries',
    to: '/contact-enquiries/all-contact-enquiries',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
]

export default _nav
