import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import SignUp from './pages/SignUp'
import Hero from './components/Hero'
import Contact from './pages/Contact'
import Login from './pages/Login'
import { UserProvider } from './context/UserContext'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Service from './pages/Service'
import { ServiceProvider } from './context/ServiceContext'
import Booking from './pages/Booking'
import { BookingProvider } from './context/BookingContext'
import Thanks from './pages/Thanks'
import AppointmentHistory from './pages/AppointmentHistory'
import Profile from './pages/Profile'
import { EmployeeProvider } from './context/EmployeeContext'
import AppointmentReminder from './components/AppointmentReminder'
import SingleService from './pages/SingleService'
import ServiceManagement from './pages/ServiceManagement'
import BeauticianProfile from './pages/BeauticianProfile'
import EmployeeManagement from './pages/EmployeeManagement'
import EmployeeProfile from './pages/EmployeeProfile'
import Appointments from './pages/Appointments'
import EmployeeAttendance from './pages/EmployeeAttendance'
import ProductManagement from './pages/ProductManagement'
import { ProductProvider } from './context/ProductContext'
import ProductDetails from './pages/ProductDetails'
import { DashboardProvider } from './context/DashboardContext'
import EmployeePerformanceDashboard from './pages/EmployeePerformanceDashboard'
import AdminAttendanceDashboard from './pages/AdminAttendanceDashboard'
import { AttendanceProvider } from './context/AttendanceContext'
import AdminEmailManagement from './pages/AdminEmailManagement'


function App() {
  

  return (
  <BrowserRouter>
    <UserProvider>
      <ServiceProvider>
        <BookingProvider>
          <ProductProvider>
            <EmployeeProvider>
              <DashboardProvider>
                <AttendanceProvider>

                  <Routes>
                    <Route>
                      <Route path='/' element={<Layout/>}>
                      <Route index element={<Home/>}/>
                      <Route path='/about' element={<About/>}/>
                      <Route path='/contact' element={<Contact/>}/>
                      <Route path='/signup' element={<SignUp/>}/>
                      <Route path='/hero' element={<Hero/>}/>
                      <Route path='/login' element={<Login/>}/>
                      <Route path='/forgot-password' element={<ForgotPassword/>}/>
                      <Route path='/reset-password/:token' element={<ResetPassword/>}/>
                      <Route path='/service' element={<Service/>}/>
                      <Route path='/book' element={<Booking/>}/>
                      <Route path='/booking-success' element={<Thanks/>}/>
                      <Route path='/history' element={<AppointmentHistory/>}/>
                      <Route path='/profile' element={<Profile/>}/>
                      <Route path='/reminder' element={<AppointmentReminder/>}/>
                      <Route path='/single/:id' element={<SingleService/>}/>
                      <Route path='/service-management' element={<ServiceManagement/>}/>
                      <Route path='/beauticianprofile' element={<BeauticianProfile/>}/>
                      <Route path='/employee-management' element={<EmployeeManagement/>}/>
                      <Route path='/employee-profile/:id' element={<EmployeeProfile/>}/>
                      <Route path='/appointments' element={<Appointments/>}/>
                      <Route path='/employee-attendance' element={<EmployeeAttendance/>}/>
                      <Route path='/product-management' element={<ProductManagement/>}/>
                      <Route path='/product-details/:id' element={<ProductDetails/>}/>
                      <Route path='/employee-performance' element={<EmployeePerformanceDashboard/>}/>
                      <Route path='/attendance-management' element={<AdminAttendanceDashboard/>}/>
                      <Route path='/email-management' element={<AdminEmailManagement/>}/>
                      </Route>
                    </Route>
                  </Routes>

                </AttendanceProvider>
              </DashboardProvider>
            </EmployeeProvider>
          </ProductProvider>
        </BookingProvider>
      </ServiceProvider>
    </UserProvider>
  </BrowserRouter>
  )
}

export default App
