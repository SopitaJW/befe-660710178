import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, LogoutIcon } from '@heroicons/react/outline';

const AddBookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    year: '',
    price: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'กรุณากรอกชื่อหนังสือ';
    } else if (formData.title.length < 2) {
      newErrors.title = 'ชื่อหนังสือต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // Author validation
    if (!formData.author.trim()) {
      newErrors.author = 'กรุณากรอกชื่อผู้แต่ง';
    } else if (formData.author.length < 2) {
      newErrors.author = 'ชื่อผู้แต่งต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // ISBN validation
    if (!formData.isbn.trim()) {
      newErrors.isbn = 'กรุณากรอก ISBN';
    } else if (!/^[0-9-]+$/.test(formData.isbn)) {
      newErrors.isbn = 'ISBN ต้องเป็นตัวเลขและเครื่องหมาย - เท่านั้น';
    }

    // Year validation
    if (!formData.year) {
      newErrors.year = 'กรุณากรอกปีที่ตีพิมพ์';
    } else {
      const yearNum = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum)) {
        newErrors.year = 'ปีต้องเป็นตัวเลขเท่านั้น';
      } else if (yearNum < 1000 || yearNum > currentYear + 1) {
        newErrors.year = `ปีต้องอยู่ระหว่าง 1000 ถึง ${currentYear + 1}`;
      }
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = 'กรุณากรอกราคา';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum)) {
        newErrors.price = 'ราคาต้องเป็นตัวเลขเท่านั้น';
      } else if (priceNum <= 0) {
        newErrors.price = 'ราคาต้องมากกว่า 0';
      } else if (priceNum > 999999) {
        newErrors.price = 'ราคาต้องไม่เกิน 999,999 บาท';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/books/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          author: formData.author.trim(),
          isbn: formData.isbn.trim(),
          year: parseInt(formData.year),
          price: parseFloat(formData.price)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add book');
      }

      const data = await response.json();
      setSuccessMessage(`เพิ่มหนังสือ "${data.title}" สำเร็จ!`);

      // Reset form
      setFormData({
        title: '',
        author: '',
        isbn: '',
        year: '',
        price: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrors({ submit: 'เกิดข้อผิดพลาดในการเพิ่มหนังสือ: ' + error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/login');
  };

  const handleCancel = () => {
    navigate('/store-manager/books');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-viridian-600 to-green-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpenIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">BookStore - BackOffice</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30
                rounded-lg transition-colors"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-viridian-600 to-green-600 text-white p-8 text-center">
              <h2 className="text-3xl font-bold">📚 เพิ่มหนังสือใหม่</h2>
              <p className="mt-2 text-viridian-100">เพิ่มหนังสือเข้าสู่ระบบร้านหนังสือ</p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {successMessage && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
                  <p className="font-semibold">✅ {successMessage}</p>
                </div>
              )}

              {errors.submit && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold">❌ {errors.submit}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อหนังสือ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                      ${errors.title
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-viridian-500 focus:border-viridian-500'}`}
                    placeholder="กรอกชื่อหนังสือ"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">⚠️ {errors.title}</p>
                  )}
                </div>

                {/* Author */}
                <div>
                  <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อผู้แต่ง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                      ${errors.author
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-viridian-500 focus:border-viridian-500'}`}
                    placeholder="กรอกชื่อผู้แต่ง"
                  />
                  {errors.author && (
                    <p className="mt-1 text-sm text-red-600">⚠️ {errors.author}</p>
                  )}
                </div>

                {/* ISBN */}
                <div>
                  <label htmlFor="isbn" className="block text-sm font-semibold text-gray-700 mb-2">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                      ${errors.isbn
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-viridian-500 focus:border-viridian-500'}`}
                    placeholder="กรอก ISBN (ตัวอย่าง: 978-3-16-148410-0)"
                  />
                  {errors.isbn && (
                    <p className="mt-1 text-sm text-red-600">⚠️ {errors.isbn}</p>
                  )}
                </div>

                {/* Year and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Year */}
                  <div>
                    <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                      ปีที่ตีพิมพ์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                        ${errors.year
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-viridian-500 focus:border-viridian-500'}`}
                      placeholder="เช่น 2024"
                    />
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600">⚠️ {errors.year}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                      ราคา (บาท) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                        ${errors.price
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-viridian-500 focus:border-viridian-500'}`}
                      placeholder="เช่น 350.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">⚠️ {errors.price}</p>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg 
                      hover:bg-gray-600 transition-colors font-semibold"
                  >
                    ❌ ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto flex-1 py-3 px-6 rounded-lg font-semibold text-white
                      transition-all duration-200 shadow-lg
                      ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-viridian-600 to-green-600 hover:from-viridian-700 hover:to-green-700'}`}
                  >
                    {isSubmitting ? '⏳ กำลังบันทึก...' : '💾 เพิ่มหนังสือ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;