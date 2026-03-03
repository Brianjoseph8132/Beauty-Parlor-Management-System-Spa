import AppointmentReminder from "../components/AppointmentReminder";
import Hero from "../components/Hero";
import Service from "../components/Service";

const Home = () => {
    return ( 
       <div className="overflow-x-hidden">
            <AppointmentReminder/>
            <Hero/>
            <Service/>
            
        </div>
     );
}
 
export default Home;