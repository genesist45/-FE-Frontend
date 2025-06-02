import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addMotorcycle,
  getMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
  // Motorcycle as MotorcycleType // MotorcycleType is implicitly Motorcycle from the functions
} from '../../../api/motorcycleApi';
import type { Motorcycle } from '../../../api/motorcycleApi'; // Explicit type import
import Breadcrumb from '../../../components/AdminBreadcrums';
import Header from '../../../layouts/AdminLayouts/AdminHeader';
import Sidemenu from '../../../layouts/AdminLayouts/AdminSidemenu';

import { useAuth } from '../../../contexts/AuthContext'; // For admin role check
import Swal from 'sweetalert2';


const AdminMotorcycleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth(); // Get user for role check
  const isEditMode = Boolean(id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [specificationImage, setSpecificationImage] = useState<File | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  const [existingSpecImagePath, setExistingSpecImagePath] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [removeExistingSpecImage, setRemoveExistingSpecImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode); // For initial data fetch in edit mode
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/'); // Or to an unauthorized page
      return;
    }

    if (isEditMode && id) {
      setPageLoading(true);
      getMotorcycle(id)
        .then((motorcycle: Motorcycle) => {
          setName(motorcycle.name);
          setPrice(motorcycle.price.toString());
          setFeatures(motorcycle.features || '');
          setDescription(motorcycle.description || '');
          setExistingImagePath(motorcycle.image_path || null);
          setExistingSpecImagePath(motorcycle.specification_image_path || null);
        })
        .catch((err) => {
          setError('Failed to load motorcycle details.');
          console.error(err);
        })
        .finally(() => setPageLoading(false));
    } else {
        // Reset form for add mode or if ID is not present
        setName('');
        setPrice('');
        setFeatures('');
        setDescription('');
        setImage(null);
        setSpecificationImage(null);
        setExistingImagePath(null);
        setExistingSpecImagePath(null);
        setRemoveExistingImage(false);
        setRemoveExistingSpecImage(false);
    }
  }, [id, isEditMode, user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setImageFunc: (file: File | null) => void, setRemoveFunc: (remove: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFunc(null);
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload only JPG, PNG, or WEBP images.');
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setImageFunc(file);
    setRemoveFunc(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!name.trim()) throw new Error('Model name is required');
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) throw new Error('Please enter a valid price');
      if (!features.trim()) throw new Error('Features are required');
      if (!description.trim()) throw new Error('Description is required');
      if (!isEditMode && !image) throw new Error('Please upload a main image');

      const formData = new FormData();
      formData.append('name', name.trim());
      // Convert price to a number and remove any formatting
      const cleanPrice = price.replace(/[₱,]/g, '');
      const numericPrice = parseFloat(cleanPrice);
      if (isNaN(numericPrice)) throw new Error('Invalid price format');
      formData.append('price', numericPrice.toString());
      formData.append('features', features.trim());
      formData.append('description', description.trim());
      
      // Handle main image
      if (image instanceof File) {
        formData.append('image', image);
      } else if (removeExistingImage && isEditMode) {
        formData.append('remove_image', 'true');
      }

      // Handle specification image
      if (specificationImage instanceof File) {
        formData.append('specification_image', specificationImage);
      } else if (removeExistingSpecImage && isEditMode) {
        formData.append('remove_specification_image', 'true');
      }

      if (isEditMode && id) {
        await updateMotorcycle(id, formData);
      } else {
        await addMotorcycle(formData);
      }
      navigate('/admin/motorcycles');
    } catch (err: any) {
      const message = err.response?.data?.message || 
                     (err.response?.data?.errors ? 
                     Object.values(err.response.data.errors).join(', ') : 
                     err.message) || 
                     `Failed to ${isEditMode ? 'update' : 'add'} motorcycle.`;
      setError(message);
      console.error('Form submission error:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;

    try {
      const result = await Swal.fire({
        title: 'Delete Motorcycle',
        text: 'Are you sure you want to delete this motorcycle? This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        setLoading(true);
        await deleteMotorcycle(id);
        
        await Swal.fire({
          title: 'Deleted!',
          text: 'The motorcycle has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        navigate('/admin/motorcycles');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the motorcycle. Please try again.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading && isEditMode) {
    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content">
                <div className="container-fluid">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-xl text-gray-600">
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            Loading motorcycle details...
                        </div>
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
        <div className="container-fluid mx-auto px-4 py-6">
          <Breadcrumb
            title={isEditMode ? "Edit Motorcycle" : "Add New Motorcycle"}
            active={isEditMode ? "Edit Details" : "Add New"}
          />

          <div className="xxl:col-span-9 col-span-12">
            <div className="box overflow-hidden main-content-card">
              <div className="box-body p-5">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Images */}
                    <div className="col-span-1">
                      {/* Image Upload Controls */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-700 mb-4">Main Image</h4>
                          <input
                            type="file"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => handleImageChange(e, setImage, setRemoveExistingImage)}
                          />
                          {(existingImagePath || image) && (
                            <>
                              <div className="mt-4 border rounded-lg overflow-hidden" style={{ maxWidth: '300px' }}>
                                {image ? (
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt="Motorcycle Preview"
                                    className="w-full h-auto"
                                  />
                                ) : existingImagePath ? (
                                  <img
                                    src={existingImagePath}
                                    alt="Motorcycle Preview"
                                    className="w-full h-auto"
                                  />
                                ) : null}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setImage(null);
                                  setRemoveExistingImage(true);
                                }}
                                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove Image
                              </button>
                            </>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-700 mb-4">Specification Table Image</h4>
                          <input
                            type="file"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => handleImageChange(e, setSpecificationImage, setRemoveExistingSpecImage)}
                          />
                          {(existingSpecImagePath || specificationImage) && (
                            <>
                              <div className="mt-4 border rounded-lg overflow-hidden" style={{ maxWidth: '300px' }}>
                                {specificationImage ? (
                                  <img
                                    src={URL.createObjectURL(specificationImage)}
                                    alt="Specification Table Preview"
                                    className="w-full h-auto"
                                  />
                                ) : existingSpecImagePath ? (
                                  <img
                                    src={existingSpecImagePath}
                                    alt="Specification Table Preview"
                                    className="w-full h-auto"
                                  />
                                ) : null}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecificationImage(null);
                                  setRemoveExistingSpecImage(true);
                                }}
                                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove Specification Image
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="col-span-1">
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-lg font-semibold text-gray-800 mb-2">
                            Model Name
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="price" className="block text-lg font-semibold text-gray-800 mb-2">
                            Price
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">₱</span>
                            <input
                              type="number"
                              id="price"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              required
                              step="0.01"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Price may vary upon branch visit.</p>
                        </div>

                        <div>
                          <label htmlFor="features" className="block text-lg font-semibold text-gray-800 mb-2">
                            Features
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <textarea
                            id="features"
                            value={features}
                            onChange={(e) => setFeatures(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={6}
                            placeholder="Enter features (one per line)"
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">Enter each feature on a new line</p>
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-2">
                            Description
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={4}
                            required
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={handleDelete}
                              disabled={loading}
                              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <i className="ri-delete-bin-line"></i>
                              {loading ? 'Deleting...' : 'Delete Motorcycle'}
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            <i className="ri-save-line"></i>
                            {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Motorcycle' : 'Add Motorcycle')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMotorcycleForm; 