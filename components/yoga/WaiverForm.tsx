
'use client';

import { useState } from 'react';

interface WaiverFormProps {
  onWaiverStateChange: (isSigned: boolean, firstName: string, lastName: string) => void;
}

export default function WaiverForm({ onWaiverStateChange }: WaiverFormProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const agreed = e.target.checked;
    setIsAgreed(agreed);
    onWaiverStateChange(agreed, firstName, lastName);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);
    onWaiverStateChange(isAgreed, newFirstName, lastName);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLastName = e.target.value;
    setLastName(newLastName);
    onWaiverStateChange(isAgreed, firstName, newLastName);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Yoga Liability Waiver & Release Form</h2>
      <div className="space-y-4 text-sm text-gray-700">
        <p><strong>1. Voluntary Participation:</strong> I acknowledge that my participation in yoga sessions with GoddessCareCo is completely voluntary, and I am fully aware of the physical activities involved.</p>
        <p><strong>2. Assumption of Risk:</strong> I understand that yoga involves physical movement, which may include breathwork, poses, stretches, and physical adjustments. There are risks of injury or strain, including but not limited to muscle injury, sprains, strains, or aggravation of pre-existing conditions.</p>
        <p><strong>3. Medical Disclosure:</strong> I affirm that I am in good health and have disclosed any medical conditions, injuries, or physical limitations that may affect my practice. If I experience any health changes, I will immediately inform the instructor.</p>
        <p><strong>4. Release of Liability:</strong> I release GoddessCareCo, as well as any assistants, employees, or contractors affiliated with the yoga practice, from all liability. This release applies to any injury or damage, including personal or bodily injury, that may result from participation in the session.</p>
        <p><strong>5. No Guarantee of Results:</strong> I understand that yoga is a practice, and results such as improved flexibility, strength, or pain relief vary from person to person. There are no guarantees of specific outcomes.</p>
      </div>
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={handleAgreementChange}
            className="mr-2"
          />
          <span>I have read, understood, and voluntarily accept the terms of this waiver and release form.</span>
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={handleFirstNameChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={handleLastNameChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
