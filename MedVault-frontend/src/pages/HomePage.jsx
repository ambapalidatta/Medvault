import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export default function HomePage({ onNavigateToRoleSelect, onNavigateToPatientAuth, loggedIn, onLogout, onNavigateToDashboard }) {
    const [activeSection, setActiveSection] = useState('');
    
    useEffect(() => {
        // Track hash changes
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            setActiveSection(hash);
        };
        
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        
        // Intersection Observer to detect visible sections
        const sections = ['about', 'shop', 'checkups', 'services', 'our-doctors', 'contact-support'];
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };
        
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    setActiveSection(sectionId);
                    // Update hash without scrolling
                    if (sectionId) {
                        window.history.replaceState(null, null, `#${sectionId}`);
                    } else {
                        window.history.replaceState(null, null, window.location.pathname);
                    }
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observe all sections
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) observer.observe(element);
        });
        
        // Observe hero section for "Home"
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.id = 'home-section';
            observer.observe(heroSection);
        }
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            observer.disconnect();
        };
    }, []);
    
    const getLinkClass = (section) => {
        // Handle home section specially
        if (section === '' && (activeSection === '' || activeSection === 'home-section')) {
            return 'text-brand-purple font-bold border-b-2 border-brand-purple';
        }
        return activeSection === section 
            ? 'text-brand-purple font-bold border-b-2 border-brand-purple' 
            : 'hover:text-brand-purple';
    };
    
    return (
        <div className="bg-white">
            <Navbar
                loggedIn={loggedIn}
                onNavigateToDashboard={onNavigateToDashboard}
                onNavigateToRoleSelect={onNavigateToRoleSelect}
                onLogout={onLogout}
                getLinkClass={getLinkClass}
            />
            
            {/* Hero Section */}
            <main className="relative overflow-hidden" style={{backgroundImage: 'url("https://i.pinimg.com/1200x/2b/21/83/2b218345934f046c6dc48881fb743233.jpg")', backgroundSize: 'cover', backgroundPosition: 'top'}}>
                <div className="absolute inset-0 bg-white/60"></div>
                <div className="container mx-auto px-8 py-16 relative z-10 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div>
                            <h2 className="text-5xl font-extrabold text-slate-900 mb-4 leading-tight drop-shadow-lg font-serif">The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Healthcare</span></h2>
                            <p className="text-lg text-slate-800 font-semibold mb-6 leading-relaxed">
                                Securely manage your medical records, book appointments with top professionals, and take control of your health journey with MedVault.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={onNavigateToRoleSelect} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-110 hover:from-pink-600 hover:to-orange-500 transition-all">
                                    Book Appointment
                                </button>
                                <button onClick={() => scrollToSection('about')} className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg border-2 border-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:scale-105 transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>
                        <div></div>
                    </div>
                    <div className="relative mt-12">
                        <div className="flex gap-4">
                            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 flex-1">
                                <p className="text-4xl font-extrabold text-purple-600 mb-1">30+</p>
                                <p className="text-sm text-slate-700 font-medium">Years Experience</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 flex-1">
                                <p className="text-4xl font-extrabold text-blue-600 mb-1">4,500+</p>
                                <p className="text-sm text-slate-700 font-medium">Happy Patients</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 flex-1">
                                <p className="text-4xl font-extrabold text-green-600 mb-1">84+</p>
                                <p className="text-sm text-slate-700 font-medium">Professionals</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 flex-1">
                                <p className="text-4xl font-extrabold text-pink-600 mb-1">300+</p>
                                <p className="text-sm text-slate-700 font-medium">Support Staff</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Medical News Section */}
            <section className="py-16 px-8 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center">
                            <i className="fas fa-newspaper text-purple-600 mr-3"></i> Recent Medical News
                        </h2>
                        <p className="text-slate-600">Stay updated with breakthroughs, research, and global health developments</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <img src="https://www.news-medical.net/image-handler/ts/20170407035009/ri/350/picture/2017/4/Blood_pressure_measuring-Sappasit_c7dd0e34690648c9b114f8414f59e269-620x480.jpg" alt="Blood Pressure" className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">Adolescents with migraines likely to have high blood pressure</p>
                                <p className="text-xs text-slate-500 mt-2">Recent studies show correlation between migraines and hypertension in teens</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <img src="https://www.news-medical.net/image-handler/ts/20180706063721/ri/350/picture/2018/7/Red_eye_for_allergy_-_sruilk_M3_04161d0d61de409b863eee9f8a1f46e8-620x480.jpg" alt="Allergy" className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">Reluctance among obstetricians to refer pregnant patients to allergy specialists</p>
                                <p className="text-xs text-slate-500 mt-2">Study reveals gaps in allergy care during pregnancy</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <img src="https://www.news-medical.net/image-handler/ts/20160209090612/ri/350/picture/2016/2/shutterstock_332159408_21374075cfba45e28314da6171c8137b-620x480.jpg" alt="Asthma" className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">Thunderstorms trigger asthma emergency visits</p>
                                <p className="text-xs text-slate-500 mt-2">Weather patterns linked to respiratory emergencies</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <img src="https://www.sapnamed.com/wp-content/uploads/2021/03/difference-between-headaches-and-migraines-1200x800.jpg" alt="Headaches" className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">How caffeine can help you manage headaches and other tips</p>
                                <p className="text-xs text-slate-500 mt-2">Moderate caffeine intake may help reduce headache pain</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <img src="https://www.childrenscolorado.org/globalassets/parenting-advice/articles/cold-vs-flu-article-image_1280x720.jpeg" alt="Flu Season" className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">Health officials worried as flu season comes five weeks early</p>
                                <p className="text-xs text-slate-500 mt-2">Earlier-than-usual flu activity raising concerns</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop" alt="Antidepressants" className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">Effects of antidepressants on physical health ranked for first time</p>
                                <p className="text-xs text-slate-500 mt-2">Study compares antidepressants impact on weight and metabolism</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* About Section */}
            <section id="about" className="py-16 px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                <div className="container mx-auto text-center max-w-5xl">
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-12 border border-purple-100">
                        <div className="mb-4">
                            <i className="fas fa-shield-heart text-5xl text-purple-600 mb-3"></i>
                        </div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4">About MedVault</h2>
                        <p className="text-slate-700 text-lg leading-relaxed mb-6">MedVault is reimagining how individuals interact with their health data. Our mission is to create a unified health experience where patients, doctors, and caregivers work together effortlessly. Through secure digital record management, real-time communication, and personalized care tools, MedVault aims to build a future where healthcare is more transparent, accessible, and empowering for everyone.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="rounded-xl overflow-hidden shadow-lg">
                                <img src="https://i.pinimg.com/736x/5f/2d/22/5f2d223bda16519ab98be294fc2c372c.jpg" alt="Medical Team" className="w-full h-48 object-cover" />
                            </div>
                            <div className="rounded-xl overflow-hidden shadow-lg">
                                <img src="https://i.pinimg.com/1200x/a3/49/0d/a3490d94e72bea469dc193034de1c864.jpg" alt="Healthcare" className="w-full h-48 object-cover" />
                            </div>
                            <div className="rounded-xl overflow-hidden shadow-lg">
                                <img src="https://i.pinimg.com/1200x/04/0a/f4/040af4ba6c4c22d9a4dbcd344b91dbb7.jpg" alt="Medical Care" className="w-full h-48 object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Shop by Categories */}
            <section id="shop" className="py-20 px-8" style={{background: 'linear-gradient(to bottom right, #F1F8E9, #E8F5E9, #DCEDC8)'}}>
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-slate-800 mb-4 text-center">Shop by Health Essentials</h2>
                    <p className="text-slate-600 text-center mb-12">Your daily healthcare needs, delivered</p>
                    <div className="relative">
                        <button onClick={() => document.getElementById('shop-scroll').scrollBy({left: -300, behavior: 'smooth'})} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg">
                            <i className="fas fa-chevron-left text-2xl text-slate-800"></i>
                        </button>
                        <div id="shop-scroll" className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                            {[
                                {name: 'Must Haves', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'},
                                {name: 'Personal Care', img: 'https://cdn.thewirecutter.com/wp-content/media/2024/12/ROUNDUP-KOREAN-SKINCARE-2048px-9732-3x2-1.jpg?auto=webp&quality=75&crop=4:3,smart&width=1024'},
                                {name: 'Vitamins', img: 'https://cdn-magazine.nutrabay.com/wp-content/uploads/2022/10/Pills-1067x800-1.jpg'},
                                {name: 'Diabetes Care', img: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=200'},
                                {name: 'Sports Nutrition', img: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200'},
                                {name: 'Mother & Baby', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200'},
                                {name: 'Wellness Packs', img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200'},
                                {name: 'Ayurveda', img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200'}
                            ].map((cat, i) => (
                                <div key={i} className="flex-shrink-0 w-64 bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer text-center">
                                    <img src={cat.img} alt={cat.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                                    <p className="font-bold text-slate-800">{cat.name}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => document.getElementById('shop-scroll').scrollBy({left: 300, behavior: 'smooth'})} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg">
                            <i className="fas fa-chevron-right text-2xl text-slate-800"></i>
                        </button>
                    </div>
                </div>
            </section>
            
            {/* Health Checkup Packages */}
            <section id="checkups" className="py-20 px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-800 mb-4">Frequently Booked Health Checkups</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {name: 'Full Body Checkup', discount: '60%', price: '₹999', original: '₹2499', desc: 'Complete health screening', color: 'purple'},
                            {name: 'Diabetes Package', discount: '50%', price: '₹599', original: '₹1199', desc: 'Blood sugar monitoring', color: 'pink'},
                            {name: 'Heart Health', discount: '55%', price: '₹799', original: '₹1799', desc: 'Cardiac wellness check', color: 'blue'},
                            {name: 'Thyroid Profile', discount: '45%', price: '₹499', original: '₹899', desc: 'Thyroid function tests', color: 'indigo'}
                        ].map((pkg, i) => (
                            <div key={i} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all relative overflow-hidden">
                                <span className={`absolute top-4 right-4 bg-${pkg.color}-500 text-white px-2 py-0.5 rounded-full text-xs font-bold`}>{pkg.discount} OFF</span>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{pkg.name}</h3>
                                    <p className="text-slate-600">{pkg.desc}</p>
                                </div>
                                <div className="mb-6">
                                    <span className="text-slate-400 line-through text-lg">{pkg.original}</span>
                                    <span className={`text-4xl font-bold text-${pkg.color}-600 ml-3`}>{pkg.price}</span>
                                </div>
                                <button className={`w-full bg-gradient-to-r from-${pkg.color}-500 to-${pkg.color}-600 text-white py-3 rounded-full font-bold hover:shadow-2xl hover:scale-105 hover:from-${pkg.color}-600 hover:to-${pkg.color}-700 transition-all`}>
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            
            {/* Our Services Section */}
            <section id="services" className="py-20 px-8 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold text-slate-800 mb-4">Our Services</h2>
                    <p className="text-slate-600 mb-12">Comprehensive healthcare solutions tailored for you</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-laptop-medical text-white text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Advanced Technology</h3>
                            <p className="text-slate-600 text-sm">State-of-the-art equipment ensuring reliable care.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-couch text-white text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Comfortable Environment</h3>
                            <p className="text-slate-600 text-sm">Designed to make your healthcare experience stress-free.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-user-md text-white text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Expert Doctors</h3>
                            <p className="text-slate-600 text-sm">Connect with certified healthcare professionals across all specializations</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-ambulance text-white text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Emergency Support</h3>
                            <p className="text-slate-600 text-sm">24/7 emergency support with instant doctor connectivity</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Contact & Support Section */}
            <section id="contact-support" className="py-20 px-8 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-slate-800 mb-12 text-center">Contact & Support</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <i className="fas fa-map-marker-alt text-3xl text-purple-600 mb-3"></i>
                            <h3 className="font-bold text-slate-800 mb-2">Office</h3>
                            <p className="text-slate-600 text-sm">123 Health St, Wellness City, 45678</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <i className="fas fa-phone text-3xl text-blue-600 mb-3"></i>
                            <h3 className="font-bold text-slate-800 mb-2">Phone Number</h3>
                            <p className="text-slate-600 text-sm">+91 1122334455</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <i className="fas fa-envelope text-3xl text-green-600 mb-3"></i>
                            <h3 className="font-bold text-slate-800 mb-2">Email</h3>
                            <p className="text-slate-600 text-sm">ambapali890@gmail.com</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <i className="fas fa-globe text-3xl text-pink-600 mb-3"></i>
                            <h3 className="font-bold text-slate-800 mb-2">Website</h3>
                            <p className="text-slate-600 text-sm">www.medvault.com</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <button onClick={() => window.location.hash = 'support'} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-12 rounded-full hover:shadow-2xl hover:scale-105 transition-all text-lg">
                            <i className="fas fa-headset mr-2"></i>Contact Support
                        </button>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="py-20 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white">
                <div className="container mx-auto text-center">
                    <h2 className="text-5xl font-extrabold mb-4">Ready to Take Control of Your Health?</h2>
                    <p className="text-purple-100 max-w-2xl mx-auto mb-8 text-lg">Join thousands of patients managing their healthcare journey with MedVault</p>
                    <button onClick={onNavigateToRoleSelect} className="bg-white text-purple-600 font-bold py-4 px-12 rounded-full hover:shadow-2xl hover:scale-110 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:text-white transition-all text-xl">
                        Book Your Appointment
                    </button>
                </div>
            </section>
            <Footer />
        </div>
    );
}
