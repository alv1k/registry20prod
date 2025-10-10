import React from 'react';
import { 
  FaHeart as FaHeartBase, 
  FaStar as FaStarBase, 
  FaUser as FaUserBase, 
  FaCog as FaCogBase, 
  FaHome as FaHomeBase,
  FaEnvelope as FaEnvelopeBase,
  FaPhone as FaPhoneBase,
  FaMapMarkerAlt as FaMapMarkerAltBase
} from 'react-icons/fa'; // Font Awesome icons
import { 
  MdFavorite as MdFavoriteBase, 
  MdStar as MdStarBase, 
  MdPerson as MdPersonBase, 
  MdSettings as MdSettingsBase,
  MdHome as MdHomeBase,
  MdEmail as MdEmailBase,
  MdPhone as MdPhoneBase,
  MdLocationOn as MdLocationOnBase
} from 'react-icons/md'; // Material Design icons
import { 
  IoMdHeart as IoMdHeartBase, 
  IoMdStar as IoMdStarBase, 
  IoMdPerson as IoMdPersonBase, 
  IoMdSettings as IoMdSettingsBase,
  IoMdHome as IoMdHomeBase
} from 'react-icons/io'; // Ionicons (similar to Expo's Ionicons)

// Define icon types properly for React 19 compatibility
type IconType = React.FC<React.SVGProps<SVGSVGElement>>;

const FaHeart = FaHeartBase as any;
const FaStar = FaStarBase as any;
const FaUser = FaUserBase as any;
const FaCog = FaCogBase as any;
const FaHome = FaHomeBase as any;
const FaEnvelope = FaEnvelopeBase as any;
const FaPhone = FaPhoneBase as any;
const FaMapMarkerAlt = FaMapMarkerAltBase as any;

const MdFavorite = MdFavoriteBase as any;
const MdStar = MdStarBase as any;
const MdPerson = MdPersonBase as any;
const MdSettings = MdSettingsBase as any;
const MdHome = MdHomeBase as any;
const MdEmail = MdEmailBase as any;
const MdPhone = MdPhoneBase as any;
const MdLocationOn = MdLocationOnBase as any;

const IoMdHeart = IoMdHeartBase as any;
const IoMdStar = IoMdStarBase as any;
const IoMdPerson = IoMdPersonBase as any;
const IoMdSettings = IoMdSettingsBase as any;
const IoMdHome = IoMdHomeBase as any;

const IconExample: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">React Icons Example</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Font Awesome Icons */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Font Awesome</h2>
          <div className="flex flex-wrap gap-2">
            <FaHeart size={24} className="text-red-500 w-6 h-6" />
            <FaStar size={24} className="text-yellow-500 w-6 h-6" />
            <FaUser size={24} className="w-6 h-6" />
            <FaCog size={24} className="w-6 h-6" />
            <FaHome size={24} className="w-6 h-6" />
            <FaEnvelope size={24} className="w-6 h-6" />
            <FaPhone size={24} className="w-6 h-6" />
            <FaMapMarkerAlt size={24} className="text-blue-500 w-6 h-6" />
          </div>
        </div>
        
        {/* Material Design Icons */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Material Design</h2>
          <div className="flex flex-wrap gap-2">
            <MdFavorite size={24} className="text-red-500 w-6 h-6" />
            <MdStar size={24} className="text-yellow-500 w-6 h-6" />
            <MdPerson size={24} className="w-6 h-6" />
            <MdSettings size={24} className="w-6 h-6" />
            <MdHome size={24} className="w-6 h-6" />
            <MdEmail size={24} className="w-6 h-6" />
            <MdPhone size={24} className="w-6 h-6" />
            <MdLocationOn size={24} className="text-blue-500 w-6 h-6" />
          </div>
        </div>
        
        {/* Ionicons (similar to Expo Vector Icons) */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Ionicons</h2>
          <div className="flex flex-wrap gap-2">
            <IoMdHeart size={24} className="text-red-500 w-6 h-6" />
            <IoMdStar size={24} className="text-yellow-500 w-6 h-6" />
            <IoMdPerson size={24} className="w-6 h-6" />
            <IoMdSettings size={24} className="w-6 h-6" />
            <IoMdHome size={24} className="w-6 h-6" />
          </div>
        </div>
        
        {/* Customization Example */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Customization</h2>
          <div className="flex flex-col gap-2">
            <FaHeart size={32} className="text-red-500 w-8 h-8" />
            <FaStar size={32} className="text-yellow-600 w-8 h-8" />
            <MdPerson size={40} className="text-blue-500 w-10 h-10" />
            <IoMdSettings size={28} className="text-gray-700 w-7 h-7" />
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Usage Examples:</h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Import specific icons
import { FaHeart, FaStar } from 'react-icons/fa';  // Font Awesome
import { MdHome, MdSettings } from 'react-icons/md';  // Material Design
import { IoMdPerson, IoMdStar } from 'react-icons/io';  // Ionicons

// Use in your components
<FaHeart className="w-6 h-6 text-red-500" />
<MdHome className="w-8 h-8 text-blue-500" />
<IoMdSettings className="w-6 h-6" />

// Use with Tailwind CSS for sizing and colors
`}
        </pre>
      </div>
    </div>
  );
};

export default IconExample;