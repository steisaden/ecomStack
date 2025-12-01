'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { YogaService, AddOnExperience } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Using regular textarea since ui/textarea doesn't exist
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import WaiverForm from './WaiverForm';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  selectedAddOns: string[];
  // Medical Intake Questionnaire
  injuryHistory: string; // "None" if not applicable
  pregnancyStatus: 'none' | 'pregnant' | 'postpartum';
  pregnancyWeeks?: string; // required if pregnant
  medications: string; // "None" if not applicable
  birthMonth: string; // 1-12 as string
  birthDay: string; // 1-31 as string
  waiverSigned: boolean;
  waiverFirstName: string;
  waiverLastName: string;
}

interface BookingFormProps {
  service: YogaService;
  addOns: AddOnExperience[];
  selectedDate: Date;
  selectedTime: string;
  onSubmit: (data: BookingFormData) => void;
}

export function BookingForm({ service, addOns, selectedDate, selectedTime, onSubmit }: BookingFormProps) {
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [waiverFirstName, setWaiverFirstName] = useState('');
  const [waiverLastName, setWaiverLastName] = useState('');

  const form = useForm<BookingFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      specialRequests: '',
      selectedAddOns: [],
      // Medical Intake defaults
      injuryHistory: '',
      pregnancyStatus: 'none',
      pregnancyWeeks: '',
      medications: '',
      birthMonth: '',
      birthDay: '',
      waiverSigned: false,
      waiverFirstName: '',
      waiverLastName: '',
    },
  });

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOnIds(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    const basePrice = service.price;
    const addOnTotal = selectedAddOnIds.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.sys.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    return basePrice + addOnTotal;
  };

  const handleWaiverStateChange = (isSigned: boolean, firstName: string, lastName: string) => {
    setWaiverSigned(isSigned);
    setWaiverFirstName(firstName);
    setWaiverLastName(lastName);
  };

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        selectedAddOns: selectedAddOnIds,
        waiverSigned,
        waiverFirstName,
        waiverLastName,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <div className="space-y-6">
      <div className="bg-beauty-light p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-beauty-dark mb-4">
          Booking Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Service:</span>
            <span className="font-medium">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{service.duration} minutes</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-beauty-primary">
            <span>Total:</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold">Contact Information</h4>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Medical Intake Questionnaire */}
          <div className="mt-6 space-y-4">
            <h4 className="text-base font-semibold">Medical Intake Questionnaire</h4>
            <p className="text-sm text-beauty-muted">Please provide complete and accurate information to help us tailor your yoga experience and ensure your safety.</p>

            {/* 1. Injury / Medical History */}
            <FormField
              control={form.control}
              name="injuryHistory"
              rules={{ required: 'Please answer this question (type "None" if not applicable).' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have any current or past injuries or medical conditions? (e.g., back pain, knee issues, heart conditions, surgeries, chronic pain)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="List any relevant injuries or conditions, or type 'None'"
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Pregnancy Status */}
            <FormField
              control={form.control}
              name="pregnancyStatus"
              rules={{ required: 'Please select your pregnancy status.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you currently pregnant or postpartum?</FormLabel>
                  <FormControl>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          value="none"
                          checked={field.value === 'none'}
                          onChange={() => field.onChange('none')}
                        />
                        <span>Not Pregnant</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          value="pregnant"
                          checked={field.value === 'pregnant'}
                          onChange={() => field.onChange('pregnant')}
                        />
                        <span>Pregnant</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          value="postpartum"
                          checked={field.value === 'postpartum'}
                          onChange={() => field.onChange('postpartum')}
                        />
                        <span>Postpartum</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('pregnancyStatus') === 'pregnant' && (
              <FormField
                control={form.control}
                name="pregnancyWeeks"
                rules={{ required: 'Please specify how far along you are (in weeks).' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>If yes, please specify how far along you are (weeks)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={45} placeholder="e.g., 20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 3. Medication Information */}
            <FormField
              control={form.control}
              name="medications"
              rules={{ required: 'Please answer this question (type "None" if not applicable).' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you currently taking any medication that might affect your yoga practice?</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="List medications that may affect your practice, or type 'None'"
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Birth Date (Month & Day only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthMonth"
                rules={{ required: 'Please select your birth month.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Month</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="" disabled>
                          Select month
                        </option>
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDay"
                rules={{ required: 'Please select your birth day.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Day</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="" disabled>
                          Select day
                        </option>
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Add-Ons */}
          {addOns && addOns.length > 0 && (
            <div>
              <FormLabel className="text-base font-medium">Add-On Experiences</FormLabel>
              <div className="space-y-3 mt-2">
                {addOns.map((addOn) => (
                  <div key={addOn.sys.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={addOn.sys.id}
                      checked={selectedAddOnIds.includes(addOn.sys.id)}
                      onCheckedChange={() => handleAddOnToggle(addOn.sys.id)}
                    />
                    <label htmlFor={addOn.sys.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-medium">{addOn.name}</span>
                        <span className="text-beauty-primary">${addOn.price}</span>
                      </div>
                      <p className="text-sm text-beauty-muted">{addOn.description}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Requests */}
          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests (Optional)</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Any special requests or notes for your session..."
                    className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] resize-vertical"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <WaiverForm onWaiverStateChange={handleWaiverStateChange} />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !waiverSigned || !waiverFirstName || !waiverLastName}
          >
            {isSubmitting ? 'Processing...' : `Book Session - $${calculateTotal()}`}
          </Button>
        </form>
      </Form>
    </div>
  );
}