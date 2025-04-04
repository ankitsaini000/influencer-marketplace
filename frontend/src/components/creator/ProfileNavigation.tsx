import Link from 'next/link';
import { useRouter } from 'next/router';

const ProfileNavigation = () => {
  const router = useRouter();

  const navLinks = [
    { name: 'Overview', path: '/creator/profile/overview', icon: 'info' },
    { name: 'Pricing', path: '/creator/profile/pricing', icon: 'monetization_on' },
    { name: 'Description', path: '/creator/profile/description', icon: 'description' },
    { name: 'Requirements', path: '/creator/profile/requirements', icon: 'assignment' },
    { name: 'Gallery', path: '/creator/profile/gallery', icon: 'collections' },
    { name: 'Social', path: '/creator/profile/social', icon: 'share' },
    { name: 'Personal Info', path: '/creator/profile/personal', icon: 'person' },
    { name: 'Publish', path: '/creator/profile/publish', icon: 'rocket_launch', highlight: true },
  ];

  return (
    <div className="flex flex-col">
      {navLinks.map((link, index) => (
        <Link 
          href={link.path} 
          key={index}
          className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
            router.pathname === link.path 
              ? 'bg-indigo-600 text-white' 
              : link.highlight 
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="material-icons mr-3">{link.icon}</span>
          <span>{link.name}</span>
          {link.highlight && (
            <span className="ml-auto bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Ready
            </span>
          )}
        </Link>
      ))}
    </div>
  );
};

export default ProfileNavigation; 