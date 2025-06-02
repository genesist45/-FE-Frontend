import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMotorcycle, Motorcycle as MotorcycleType } from '../../api/motorcycleApi';
import Header from '../../layouts/UserLayouts/UserHeader';
import Sidemenu from '../../layouts/UserLayouts/UserSidemenu';
import Breadcrumb from '../../components/UserBreadcrums';
import Installment from "../../layouts/UserLayouts/InstallmentCalculator/Installment";

// Import related motorcycle images for the example
import Honda_winnerX from "../../assets/photos/motors/hondax.png";
import Honda_Click from "../../assets/photos/motors/hondaClick.png";
import Honda_Alpha from "../../assets/photos/motors/hondaAlpha.png";
import Honda_RS from "../../assets/photos/motors/hondaRS.png";

const UserMotorcycleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [motorcycle, setMotorcycle] = useState<MotorcycleType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCalculator, setShowCalculator] = useState(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getMotorcycle(id)
                .then(data => {
                    setMotorcycle(data);
                    setError(null);
                })
                .catch(err => {
                    console.error("Failed to fetch motorcycle details:", err);
                    setError("Sorry, we couldn't find the motorcycle you're looking for.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <Sidemenu />
                <div className="main-content app-content">
                    <div className="container-fluid text-center py-5">Loading motorcycle details...</div>
                </div>
            </>
        );
    }

    if (error || !motorcycle) {
        return (
            <>
                <Header />
                <Sidemenu />
                <div className="main-content app-content">
                    <div className="container-fluid">
                        <Breadcrumb title="Motorcycle Not Found" active="Error" />
                        <div className="alert alert-danger mt-4 text-center" role="alert">
                            {error || "Motorcycle details could not be loaded."}
                        </div>
                        <div className="text-center mt-4">
                            <Link to="/motorcycles" className="btn btn-primary">
                                Back to Motorcycles
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content">
                <div className="container-fluid">
                    <Breadcrumb
                        title={motorcycle.name}
                        links={[{ text: "Motorcycles", link: "/motorcycles" }]}
                        active={motorcycle.name}
                    />
                    <div className="xxl:col-span-9 col-span-12">
                        <div className="box overflow-hidden main-content-card">
                            <div className="box-body p-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1 border-2 border-gray-300">
                                        <img 
                                            src={motorcycle.image_path || '/placeholder-motorcycle.png'} 
                                            alt={motorcycle.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '/placeholder-motorcycle.png';
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <h1 className="mt-8 mb-6 text-2xl font-bold">{motorcycle.name}</h1>
                                        <h4 className="mt-2 mb-2 text-xl">₱{motorcycle.price.toLocaleString()}.00</h4>
                                        <p className="text-gray-600">Price may vary upon branch visit.</p>
                                        <h4 className="mt-1 mb-6 text-xl font-semibold">Features</h4>
                                        <ul className="list-none space-y-2">
                                            {motorcycle.features?.split('\n').map((feature, index) => (
                                                <li key={index}>• {feature.trim()}</li>
                                            ))}
                                        </ul>

                                        <div className="flex flex-col gap-2 m-2 p-2 mt-4">
                                            <Link 
                                                to="/form"
                                                className="w-60 text-center px-4 py-2 rounded-lg text-white bg-blue-600 border border-black"
                                                onClick={() => window.scrollTo({ top: 0})}>
                                                <i className="bi bi-pencil-square"></i> Pre-Register
                                            </Link>
                                            
                                            <button 
                                                onClick={() => setShowCalculator(true)}
                                                className="mt-2 w-60 text-center px-4 py-2 rounded-lg text-white bg-gray-600 border border-black"
                                            >
                                                <i className="bi bi-cash"></i> Installment Calculator
                                            </button>

                                            {showCalculator && (
                                                <Installment
                                                    motorcyclePrice={motorcycle.price}
                                                    onClose={() => setShowCalculator(false)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <h4 className="mt-4 mb-2 text-xl font-semibold">Description</h4>
                                <p className="text-gray-700">
                                    {motorcycle.description}
                                </p>

                                <h4 className="mt-6 mb-2 text-xl font-semibold">Specification</h4>
                                <div className="flex gap-4">
                                    {motorcycle.specification_image_path ? (
                                        <img 
                                            src={motorcycle.specification_image_path} 
                                            alt={`${motorcycle.name} Specifications`}
                                            className="w-full max-h-[600px] object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '/placeholder-motorcycle.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full text-center py-4 text-gray-500">
                                            Specification image not available
                                        </div>
                                    )}
                                </div>

                                <h4 className="mt-8 mb-2 text-xl font-semibold">Related Products</h4>
                                <p className="text-gray-700">
                                    Explore our featured motorcycles. More models coming soon!
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                                    {[
                                        { image: Honda_winnerX, name: "Honda WINNER X", price: "131,900.00", link: "/HondaX" },
                                        { image: Honda_Click, name: "Honda CLICK125", price: "80,900.00", link: "/HondaClick" },
                                        { image: Honda_Alpha, name: "Honda TMX125 Alpha", price: "56,900.00", link: "/HondaAlpha" },
                                        { image: Honda_RS, name: "Honda RS125", price: "75,900.00", link: "/HondaRS" }
                                    ].map((relatedMotorcycle, index) => (
                                        <Link 
                                            key={index}
                                            to={relatedMotorcycle.link} 
                                            className="block text-center"
                                            onClick={() => window.scrollTo({ top: 100 })}
                                        >
                                            <div className="p-3 rounded shadow-md border border-gray-300 rounded-md">
                                                <img
                                                    src={relatedMotorcycle.image}
                                                    alt={relatedMotorcycle.name}
                                                    className="w-full h-auto"
                                                />
                                                <p className="text-sm font-medium hover:underline">
                                                    {relatedMotorcycle.name}
                                                </p>
                                                <p className="bg-red-500 text-white rounded p-3 mt-3 rounded-md">
                                                    ₱{relatedMotorcycle.price}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserMotorcycleDetail; 