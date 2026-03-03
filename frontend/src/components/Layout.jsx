import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";

const Layout = () => {
    return ( 
        <div>
            <Navbar/>

            <div className="">
                <Outlet/>
                <ToastContainer/>
            </div>

            <Footer/>
        </div>
     );
}
 
export default Layout;