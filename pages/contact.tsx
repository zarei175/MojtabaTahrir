'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/layout/Layout';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'wholesale' | 'complaint';
}

const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: 'تلفن تماس',
      details: ['۰۲۱-۱۲۳۴۵۶۷۸', '۰۹۱۲۳۴۵۶۷۸۹'],
      action: 'tel:+982112345678'
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: 'ایمیل',
      details: ['info@mojtabatahrir.com', 'support@mojtabatahrir.com'],
      action: 'mailto:info@mojtabatahrir.com'
    },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: 'آدرس',
      details: ['تهران، خیابان انقلاب', 'نرسیده به چهارراه کالج، پلاک ۱۲۳'],
      action: 'https://maps.google.com'
    },
    {
      icon: <ClockIcon className="w-6 h-6" />,
      title: 'ساعات کاری',
      details: ['شنبه تا پنج‌شنبه: ۸:۰۰ - ۱۸:۰۰', 'جمعه: ۹:۰۰ - ۱۳:۰۰'],
      action: null
    }
  ];

  const departments = [
    {
      title: 'فروش و مشاوره',
      description: 'برای خرید محصولات و دریافت مشاوره',
      phone: '۰۲۱-۱۲۳۴۵۶۷۸',
      email: 'sales@mojtabatahrir.com'
    },
    {
      title: 'پشتیبانی فنی',
      description: 'برای مشکلات فنی و پشتیبانی',
      phone: '۰۲۱-۱۲۳۴۵۶۷۹',
      email: 'support@mojtabatahrir.com'
    },
    {
      title: 'فروش عمده',
      description: 'برای خریدهای عمده و سازمانی',
      phone: '۰۲۱-۱۲۳۴۵۶۸۰',
      email: 'wholesale@mojtabatahrir.com'
    }
  ];

  // Handle form input changes
  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};

    if (!form.name.trim()) newErrors.name = 'نام الزامی است';
    if (!form.email.trim()) newErrors.email = 'ایمیل الزامی است';
    if (!form.subject.trim()) newErrors.subject = 'موضوع الزامی است';
    if (!form.message.trim()) newErrors.message = 'پیام الزامی است';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست';
    }

    // Phone validation (optional)
    if (form.phone) {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone = 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      alert('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>تماس با ما - مجتبی تحریر</title>
        <meta 
          name="description" 
          content="تماس با فروشگاه مجتبی تحریر. آدرس، تلفن، ایمیل و فرم تماس برای دریافت مشاوره و پشتیبانی." 
        />
        <meta 
          name="keywords" 
          content="تماس با ما، آدرس مجتبی تحریر، تلفن، ایمیل، پشتیبانی، مشاوره" 
        />
        <meta property="og:title" content="تماس با ما - مجتبی تحریر" />
        <meta property="og:description" content="راه‌های ارتباط با فروشگاه مجتبی تحریر" />
        <link rel="canonical" href="https://mojtabatahrir.com/contact" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-l from-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">تماس با ما</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              ما همیشه آماده پاسخگویی به سوالات و نیازهای شما هستیم
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">خانه</Link>
              <span className="mx-2">/</span>
              <span>تماس با ما</span>
            </nav>
          </div>
        </div>

        {/* Contact Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">اطلاعات تماس</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                از طریق راه‌های زیر می‌توانید با ما در ارتباط باشید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        {info.action ? (
                          <a 
                            href={info.action} 
                            className="hover:text-blue-600 transition-colors"
                            target={info.action.startsWith('http') ? '_blank' : undefined}
                            rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {detail}
                          </a>
                        ) : (
                          detail
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">بخش‌های مختلف</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                بر اساس نیاز خود با بخش مربوطه تماس بگیرید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {departments.map((dept, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600 ml-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dept.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    {dept.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 ml-2" />
                      <a href={`tel:${dept.phone.replace(/[^0-9]/g, '')}`} className="hover:text-blue-600">
                        {dept.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 ml-2" />
                      <a href={`mailto:${dept.email}`} className="hover:text-blue-600">
                        {dept.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">ارسال پیام</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  پیام خود را برای ما ارسال کنید تا در اسرع وقت پاسخ دهیم
                </p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    پیام شما با موفقیت ارسال شد
                  </h3>
                  <p className="text-green-700 mb-6">
                    تیم پشتیبانی ما در اسرع وقت با شما تماس خواهد گرفت
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ارسال پیام جدید
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام و نام خانوادگی *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="نام خود را وارد کنید"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ایمیل *
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="example@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تلفن
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="09123456789"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع پیام
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general">عمومی</option>
                        <option value="support">پشتیبانی فنی</option>
                        <option value="wholesale">فروش عمده</option>
                        <option value="complaint">شکایت</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موضوع *
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="موضوع پیام خود را وارد کنید"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      پیام *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="پیام خود را اینجا بنویسید..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5 ml-3" />
                          ارسال پیام
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">موقعیت ما</h2>
              <p className="text-gray-600">
                آدرس دقیق فروشگاه مجتبی تحریر در نقشه
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.9999999999995!2d51.42!3d35.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQyJzAwLjAiTiA1McKwMjUnMTIuMCJF!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="موقعیت مجتبی تحریر"
                />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default ContactPage;