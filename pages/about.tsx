'use client';

import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  UserGroupIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  StarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/layout/Layout';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <CheckCircleIcon className="w-8 h-8 text-blue-600" />,
      title: 'کیفیت تضمینی',
      description: 'تمام محصولات ما دارای ضمانت کیفیت و اصالت هستند'
    },
    {
      icon: <TruckIcon className="w-8 h-8 text-green-600" />,
      title: 'ارسال سریع',
      description: 'ارسال رایگان در سراسر کشور برای خریدهای بالای ۵۰۰ هزار تومان'
    },
    {
      icon: <UserGroupIcon className="w-8 h-8 text-purple-600" />,
      title: 'پشتیبانی ۲۴/۷',
      description: 'تیم پشتیبانی ما همیشه آماده کمک به شما هستند'
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-red-600" />,
      title: 'خرید امن',
      description: 'امنیت کامل در تمام مراحل خرید و پرداخت'
    }
  ];

  const stats = [
    { number: '۱۰+', label: 'سال تجربه' },
    { number: '۵۰۰۰+', label: 'مشتری راضی' },
    { number: '۱۰۰۰+', label: 'محصول متنوع' },
    { number: '۹۸٪', label: 'رضایت مشتریان' }
  ];

  const team = [
    {
      name: 'مجتبی احمدی',
      role: 'مدیر عامل',
      image: '/images/team/ceo.jpg',
      description: 'بیش از ۱۵ سال تجربه در صنعت لوازم التحریر'
    },
    {
      name: 'فاطمه رضایی',
      role: 'مدیر فروش',
      image: '/images/team/sales-manager.jpg',
      description: 'متخصص در فروش B2B و روابط با مشتریان سازمانی'
    },
    {
      name: 'علی محمدی',
      role: 'مدیر فنی',
      image: '/images/team/tech-manager.jpg',
      description: 'مسئول توسعه و نگهداری پلتفرم آنلاین'
    }
  ];

  return (
    <>
      <Head>
        <title>درباره ما - مجتبی تحریر</title>
        <meta 
          name="description" 
          content="آشنایی با فروشگاه مجتبی تحریر، تاریخچه، اهداف و تیم ما. بیش از ۱۰ سال تجربه در ارائه بهترین لوازم التحریر و نوشت‌افزار." 
        />
        <meta 
          name="keywords" 
          content="درباره مجتبی تحریر، تاریخچه، تیم، لوازم التحریر، نوشت افزار" 
        />
        <meta property="og:title" content="درباره ما - مجتبی تحریر" />
        <meta property="og:description" content="آشنایی با فروشگاه مجتبی تحریر و تیم متخصص ما" />
        <link rel="canonical" href="https://mojtabatahrir.com/about" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-l from-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">درباره مجتبی تحریر</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              بیش از یک دهه تجربه در ارائه بهترین لوازم التحریر و نوشت‌افزار
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">خانه</Link>
              <span className="mx-2">/</span>
              <span>درباره ما</span>
            </nav>
          </div>
        </div>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">داستان ما</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    فروشگاه مجتبی تحریر در سال ۱۳۹۰ با هدف ارائه بهترین لوازم التحریر و نوشت‌افزار 
                    به مشتریان عزیز آغاز به کار کرد. ما با درک نیازهای متنوع دانش‌آموزان، دانشجویان، 
                    کارمندان و سازمان‌ها، تلاش کردیم تا محصولاتی با کیفیت و قیمت مناسب ارائه دهیم.
                  </p>
                  <p>
                    در طول این سال‌ها، ما توانسته‌ایم اعتماد هزاران مشتری را جلب کنیم و به یکی از 
                    معتبرترین فروشگاه‌های لوازم التحریر در کشور تبدیل شویم. تمرکز ما بر کیفیت محصولات، 
                    خدمات پس از فروش و رضایت مشتریان است.
                  </p>
                  <p>
                    امروزه با راه‌اندازی فروشگاه آنلاین، ما قادر هستیم خدمات خود را به سراسر کشور 
                    گسترش دهیم و تجربه خرید راحت و مطمئنی را برای مشتریان فراهم کنیم.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <Image
                  src="/images/about/story.jpg"
                  alt="داستان مجتبی تحریر"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="text-3xl font-bold">۱۰+</div>
                  <div className="text-sm">سال تجربه</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">آمار و ارقام</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                نگاهی به دستاوردهای ما در طول سال‌های فعالیت
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">ماموریت ما</h3>
                <p className="text-gray-600 leading-relaxed">
                  ارائه بهترین لوازم التحریر و نوشت‌افزار با کیفیت عالی و قیمت مناسب، 
                  همراه با خدمات پس از فروش بی‌نظیر برای تمام مشتریان عزیز. ما متعهد هستیم 
                  که نیازهای شما را در کمترین زمان و با بالاترین کیفیت برآورده کنیم.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">چشم‌انداز ما</h3>
                <p className="text-gray-600 leading-relaxed">
                  تبدیل شدن به بزرگ‌ترین و معتبرترین فروشگاه آنلاین لوازم التحریر در کشور، 
                  با ارائه محصولات متنوع، خدمات نوآورانه و تجربه خرید بی‌نظیر. ما در تلاش 
                  هستیم تا استانداردهای جدیدی در صنعت لوازم التحریر تعریف کنیم.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">چرا مجتبی تحریر؟</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                ویژگی‌هایی که ما را از سایر فروشگاه‌ها متمایز می‌کند
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">تیم ما</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                آشنایی با اعضای تیم متخصص مجتبی تحریر
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="relative h-64">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-l from-blue-600 to-purple-700">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-3xl font-bold mb-4">آماده همکاری با شما هستیم</h2>
              <p className="text-xl mb-8 text-blue-100">
                برای کسب اطلاعات بیشتر یا مشاوره رایگان با ما تماس بگیرید
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <EnvelopeIcon className="w-5 h-5 ml-2" />
                  تماس با ما
                </Link>
                
                <a
                  href="tel:+982112345678"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 ml-2" />
                  ۰۲۱-۱۲۳۴۵۶۷۸
                </a>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default AboutPage;