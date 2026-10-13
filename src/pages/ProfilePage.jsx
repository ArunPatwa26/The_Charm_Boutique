import {
  useState,
  useEffect,
  useRef,
} from 'react';

import { motion } from 'framer-motion';

import {
  UserIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import { useForm } from 'react-hook-form';

import {
  yupResolver,
} from '@hookform/resolvers/yup';

import * as yup from 'yup';

import {
  useAuth,
} from '../context/AuthContext';

import {
  updateProfile,
} from '../services/authService';

import LoadingSpinner from '../components/common/LoadingSpinner';

import toast from 'react-hot-toast';


// ============================================================
// VALIDATION
// ============================================================

const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(
      2,
      'Name must be at least 2 characters'
    ),

  phone: yup
    .string()
    .test(
      'phone-validation',
      'Enter a valid 10 digit phone number',
      (value) => {
        if (!value) return true;
        return /^[0-9]{10}$/.test(
          value
        );
      }
    ),

  street: yup.string(),

  city: yup.string(),

  state: yup.string(),

  zip_code: yup
    .string()
    .test(
      'zip-validation',
      'Invalid ZIP / PIN code',
      (value) => {
        if (!value) return true;
        return /^\d{5,6}$/.test(
          value
        );
      }
    ),

  country: yup.string(),
});


// ============================================================
// COMPONENT
// ============================================================

const ProfilePage = () => {

  const {
    user,
    updateUser,
  } = useAuth();


  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [avatarPreview, setAvatarPreview] =
    useState(
      user?.avatar || ''
    );

  const fileInputRef =
    useRef(null);


  // ==========================================================
  // FORM
  // ==========================================================

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
    reset,
    setValue,
  } = useForm({

    resolver:
      yupResolver(
        profileSchema
      ),

    defaultValues: {
      name:
        user?.name || '',

      phone:
        user?.phone || '',

      street:
        user?.address?.street || '',

      city:
        user?.address?.city || '',

      state:
        user?.address?.state || '',

      zip_code:
        user?.address?.zip_code || '',

      country:
        user?.address?.country || '',
    },
  });


  // ==========================================================
  // UPDATE FORM WHEN USER CHANGES
  // ==========================================================

  useEffect(() => {

    if (!user) return;

    reset({
      name:
        user.name || '',

      phone:
        user.phone || '',

      street:
        user.address?.street || '',

      city:
        user.address?.city || '',

      state:
        user.address?.state || '',

      zip_code:
        user.address?.zip_code || '',

      country:
        user.address?.country || '',
    });

    setAvatarPreview(
      user.avatar || ''
    );

  }, [
    user,
    reset,
  ]);


  // ==========================================================
  // AVATAR CHANGE
  // ==========================================================

  const handleAvatarChange = (
    event
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) return;


    // File type
    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      toast.error(
        'Please select a valid image'
      );

      return;
    }


    // File size
    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        'Image must be smaller than 5MB'
      );

      return;
    }


    setAvatarFile(
      file
    );


    const reader =
      new FileReader();

    reader.onloadend = () => {

      setAvatarPreview(
        reader.result
      );
    };

    reader.readAsDataURL(
      file
    );
  };


  // ==========================================================
  // REMOVE SELECTED AVATAR
  // ==========================================================

  const handleRemoveAvatar = () => {

    setAvatarFile(
      null
    );

    setAvatarPreview(
      user?.avatar || ''
    );

    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        '';
    }
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const onSubmit = async (
    data
  ) => {

    setLoading(
      true
    );

    try {

      const formData =
        new FormData();


      // Name
      formData.append(
        'name',
        data.name.trim()
      );


      // Phone
      if (
        data.phone?.trim()
      ) {

        formData.append(
          'phone',
          data.phone.trim()
        );
      }


      // Address - Only send if any field has value
      const address = {
        street:
          data.street?.trim() || '',

        city:
          data.city?.trim() || '',

        state:
          data.state?.trim() || '',

        zip_code:
          data.zip_code?.trim() || '',

        country:
          data.country?.trim() || '',
      };


      const hasAddress =
        Object.values(
          address
        ).some(
          (value) =>
            value.length > 0
        );


      if (hasAddress) {

        formData.append(
          'address',
          JSON.stringify(
            address
          )
        );
      }


      // Avatar - IMPORTANT: Append the file
      if (avatarFile) {

        formData.append(
          'avatar',
          avatarFile,
          avatarFile.name
        );
      }


      // API
      const response =
        await updateProfile(
          formData
        );


      if (
        response?.success
      ) {

        // Update AuthContext
        updateUser(
          response.user
        );

        // Update local storage
        localStorage.setItem(
          'user',
          JSON.stringify(
            response.user
          )
        );

        toast.success(
          'Profile updated successfully!'
        );

        setIsEditing(
          false
        );

        setAvatarFile(
          null
        );

      } else {

        toast.error(
          response?.message ||
            'Profile update failed'
        );
      }

    } catch (error) {

      console.error(
        'Profile Update Error:',
        error
      );


      toast.error(
        error?.detail ||
          error?.message ||
          'Failed to update profile'
      );

    } finally {

      setLoading(
        false
      );
    }
  };


  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {

    setIsEditing(
      false
    );

    setAvatarFile(
      null
    );

    setAvatarPreview(
      user?.avatar || ''
    );


    reset({
      name:
        user?.name || '',

      phone:
        user?.phone || '',

      street:
        user?.address?.street || '',

      city:
        user?.address?.city || '',

      state:
        user?.address?.state || '',

      zip_code:
        user?.address?.zip_code || '',

      country:
        user?.address?.country || '',
    });


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        '';
    }
  };


  // ==========================================================
  // NO USER
  // ==========================================================

  if (!user) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="min-h-screen bg-gray-50 py-8">

      <div className="container-custom max-w-5xl">

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                My Profile
              </h1>

              <p className="text-gray-600 mt-1">
                Manage your personal information and profile
              </p>

            </div>


            {!isEditing && (

              <button
                type="button"
                onClick={() =>
                  setIsEditing(true)
                }
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >

                <PencilIcon className="w-5 h-5" />

                Edit Profile

              </button>

            )}

          </div>


          {/* =================================================
              MAIN PROFILE CARD
          ================================================= */}

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">


            {/* =================================================
                PROFILE COVER
            ================================================= */}

            <div className="relative bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 px-6 py-14">

              <div className="absolute inset-0 bg-black/5" />

              <div className="relative flex flex-col items-center">


                {/* AVATAR */}

                <div className="relative">

                  <div className="w-36 h-36 rounded-full bg-white/30 backdrop-blur-md p-1.5 shadow-2xl">

                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">

                      {avatarPreview ? (

                        <img
                          src={avatarPreview}
                          alt={
                            user.name ||
                            'Profile'
                          }
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center">

                          <UserIcon className="w-20 h-20 text-gray-400" />

                        </div>

                      )}

                    </div>

                  </div>


                  {/* CAMERA */}

                  {isEditing && (

                    <>

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="absolute bottom-1 right-1 bg-white text-gold-600 rounded-full p-3 shadow-xl hover:scale-110 transition"
                        title="Change profile picture"
                      >

                        <CameraIcon className="w-5 h-5" />

                      </button>


                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={
                          handleAvatarChange
                        }
                        className="hidden"
                      />

                    </>

                  )}

                </div>


                {/* REMOVE PHOTO */}

                {isEditing &&
                  avatarFile && (

                    <button
                      type="button"
                      onClick={
                        handleRemoveAvatar
                      }
                      className="mt-3 text-white/90 hover:text-white text-sm flex items-center gap-1"
                    >

                      <TrashIcon className="w-4 h-4" />

                      Remove selected photo

                    </button>

                  )}


                <h2 className="text-2xl md:text-3xl font-bold text-white mt-5">

                  {user.name}

                </h2>


                <p className="text-white/80 flex items-center gap-2 mt-1">

                  <EnvelopeIcon className="w-4 h-4" />

                  {user.email}

                </p>


                <span className="mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm text-white">

                  {user.role === 'admin'
                    ? 'Administrator'
                    : 'Customer'}

                </span>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <div className="p-6 md:p-8">

              <form
                onSubmit={
                  handleSubmit(
                    onSubmit
                  )
                }
              >

                <div className="space-y-8">


                  {/* =================================================
                      PERSONAL INFORMATION
                  ================================================= */}

                  <section>

                    <div className="flex items-center gap-3 mb-5">

                      <div className="p-2 bg-gold-100 rounded-xl">

                        <UserIcon className="w-5 h-5 text-gold-600" />

                      </div>

                      <div>

                        <h3 className="text-xl font-semibold text-gray-900">

                          Personal Information

                        </h3>

                        <p className="text-sm text-gray-500">

                          Your basic account information

                        </p>

                      </div>

                    </div>


                    <div className="grid md:grid-cols-2 gap-5">


                      {/* NAME */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Full Name *

                        </label>

                        <input
                          {...register(
                            'name'
                          )}
                          disabled={
                            !isEditing
                          }
                          className={`input-field ${
                            errors.name
                              ? 'border-red-500'
                              : ''
                          } ${
                            !isEditing
                              ? 'bg-gray-50 cursor-not-allowed'
                              : ''
                          }`}
                          placeholder="Enter your full name"
                        />

                        {errors.name && (

                          <p className="text-sm text-red-500 mt-1">

                            {errors.name.message}

                          </p>

                        )}

                      </div>


                      {/* EMAIL */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Email Address

                        </label>

                        <div className="relative">

                          <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                          <input
                            value={
                              user.email || ''
                            }
                            disabled
                            className="input-field pl-12 bg-gray-50 cursor-not-allowed"
                          />

                        </div>

                        <p className="text-xs text-gray-500 mt-1">

                          Email cannot be changed.

                        </p>

                      </div>


                      {/* PHONE */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Phone Number

                        </label>

                        <div className="relative">

                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                          <input
                            {...register(
                              'phone'
                            )}
                            disabled={
                              !isEditing
                            }
                            placeholder="10 digit phone number"
                            className={`input-field pl-12 ${
                              errors.phone
                                ? 'border-red-500'
                                : ''
                            } ${
                              !isEditing
                                ? 'bg-gray-50 cursor-not-allowed'
                                : ''
                            }`}
                          />

                        </div>

                        {errors.phone && (

                          <p className="text-sm text-red-500 mt-1">

                            {errors.phone.message}

                          </p>

                        )}

                      </div>


                      {/* ROLE */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Account Type

                        </label>

                        <div className="relative">

                          <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                          <input
                            value={
                              user.role === 'admin'
                                ? 'Administrator'
                                : 'Customer'
                            }
                            disabled
                            className="input-field pl-12 bg-gray-50 cursor-not-allowed"
                          />

                        </div>

                      </div>

                    </div>

                  </section>


                  {/* =================================================
                      ADDRESS
                  ================================================= */}

                  <section className="pt-8 border-t border-gray-200">

                    <div className="flex items-center gap-3 mb-5">

                      <div className="p-2 bg-gold-100 rounded-xl">

                        <MapPinIcon className="w-5 h-5 text-gold-600" />

                      </div>

                      <div>

                        <h3 className="text-xl font-semibold text-gray-900">

                          Address

                        </h3>

                        <p className="text-sm text-gray-500">

                          Your delivery and billing address

                        </p>

                      </div>

                    </div>


                    <div className="grid md:grid-cols-2 gap-5">


                      {/* STREET */}

                      <div className="md:col-span-2">

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Street Address

                        </label>

                        <input
                          {...register(
                            'street'
                          )}
                          disabled={
                            !isEditing
                          }
                          placeholder="House no, street, area"
                          className={`input-field ${
                            !isEditing
                              ? 'bg-gray-50 cursor-not-allowed'
                              : ''
                          }`}
                        />

                      </div>


                      {/* CITY */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          City

                        </label>

                        <input
                          {...register(
                            'city'
                          )}
                          disabled={
                            !isEditing
                          }
                          placeholder="Enter city"
                          className={`input-field ${
                            !isEditing
                              ? 'bg-gray-50 cursor-not-allowed'
                              : ''
                          }`}
                        />

                      </div>


                      {/* STATE */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          State

                        </label>

                        <input
                          {...register(
                            'state'
                          )}
                          disabled={
                            !isEditing
                          }
                          placeholder="Enter state"
                          className={`input-field ${
                            !isEditing
                              ? 'bg-gray-50 cursor-not-allowed'
                              : ''
                          }`}
                        />

                      </div>


                      {/* ZIP */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          ZIP / PIN Code

                        </label>

                        <input
                          {...register(
                            'zip_code'
                          )}
                          disabled={
                            !isEditing
                          }
                          placeholder="Enter PIN code"
                          className={`input-field ${
                            errors.zip_code
                              ? 'border-red-500'
                              : ''
                          } ${
                            !isEditing
                              ? 'bg-gray-50 cursor-not-allowed'
                              : ''
                          }`}
                        />

                        {errors.zip_code && (

                          <p className="text-sm text-red-500 mt-1">

                            {errors.zip_code.message}

                          </p>

                        )}

                      </div>


                      {/* COUNTRY */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Country

                        </label>

                        <input
                          {...register(
                            'country'
                          )}
                          disabled={
                            !isEditing
                          }
                          placeholder="Enter country"
                          className={`input-field ${
                            !isEditing
                              ? 'bg-gray-50 cursor-not-allowed'
                              : ''
                          }`}
                        />

                      </div>

                    </div>

                  </section>


                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}

                  {isEditing && (

                    <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">

                      <button
                        type="submit"
                        disabled={
                          loading
                        }
                        className="btn-primary flex-1 sm:flex-none sm:min-w-[180px] flex items-center justify-center gap-2 disabled:opacity-60"
                      >

                        {loading ? (

                          <LoadingSpinner size="sm" />

                        ) : (

                          <>

                            <CheckCircleIcon className="w-5 h-5" />

                            Save Changes

                          </>

                        )}

                      </button>


                      <button
                        type="button"
                        onClick={
                          handleCancel
                        }
                        disabled={
                          loading
                        }
                        className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >

                        <XMarkIcon className="w-5 h-5" />

                        Cancel

                      </button>

                    </div>

                  )}

                </div>

              </form>

            </div>

          </div>


          {/* =================================================
              ACCOUNT STATS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">


            <div className="bg-white rounded-2xl shadow-lg p-6">

              <p className="text-3xl font-bold text-gold-600">

                {user.wishlist?.length || 0}

              </p>

              <p className="text-gray-600 mt-1">

                Wishlist Items

              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-lg p-6">

              <p className="text-3xl font-bold text-gold-600">

                {user.is_active
                  ? 'Active'
                  : 'Inactive'}

              </p>

              <p className="text-gray-600 mt-1">

                Account Status

              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-lg p-6">

              <p className="text-3xl font-bold text-gold-600">

                {user.created_at
                  ? new Date(
                      user.created_at
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        month:
                          'short',
                        year:
                          'numeric',
                      }
                    )
                  : '—'}

              </p>

              <p className="text-gray-600 mt-1">

                Member Since

              </p>

            </div>

          </div>


        </motion.div>

      </div>

    </div>
  );
};


export default ProfilePage;