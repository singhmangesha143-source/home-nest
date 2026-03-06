import { HiShieldCheck, HiLightBulb, HiUsers, HiGlobe } from 'react-icons/hi';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Predictnest</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            We're building the smartest way to find your perfect living space. 
            Predictnest uses intelligent recommendations to match you with rooms 
            that fit your budget, lifestyle, and location preferences.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Finding the right room shouldn't be a stressful experience. Whether you're a student 
              relocating for studies, a professional moving to a new city, or a migrant looking for 
              safe and affordable housing — Predictnest is here to simplify your search.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform combines smart filtering, personalized recommendations, and verified 
              listings to ensure you find exactly what you're looking for, without the hassle of 
              traditional room-hunting.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: HiLightBulb, label: 'Smart Matching', value: 'AI-powered' },
              { icon: HiShieldCheck, label: 'Verified Listings', value: '100%' },
              { icon: HiUsers, label: 'Happy Tenants', value: '10,000+' },
              { icon: HiGlobe, label: 'Cities Covered', value: '50+' },
            ].map((item, i) => (
              <div key={i} className="card p-6 text-center hover:-translate-y-1">
                <item.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Personalized Recommendations',
                desc: 'Our scoring algorithm matches rooms to your exact requirements — budget, location, amenities, and lifestyle preferences all factor in.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                title: 'Transparent Process',
                desc: 'No hidden fees, no fake listings. Every property is verified by our team, and every rental agreement is clear and fair.',
                color: 'bg-green-50 text-green-600',
              },
              {
                title: 'End-to-End Support',
                desc: 'From search to move-in, we support you throughout. Schedule visits, compare rooms, and connect directly with verified landlords.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((item, i) => (
              <div key={i} className="card p-8">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <HiShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built With Care</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Predictnest is developed by a passionate team dedicated to solving the room-finding 
            problem for millions of students, professionals, and migrants across India.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
