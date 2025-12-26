'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Still used for Date Management
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getYogaServices } from '@/lib/yoga';
import { YogaService, Availability } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { sortTimeStrings, to12HourFormat, compareTimeStrings } from '@/lib/timeUtils';
import { TimeSlotSelector } from './TimeSlotSelector';
import { WeeklyScheduleTab } from './WeeklyScheduleTab';
import { intersection } from 'lodash';

export function YogaAvailabilityManager({ initialYogaServices }: { initialYogaServices: YogaService[] }) {
  const [services] = useState<YogaService[]>(initialYogaServices);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialYogaServices.length > 0 ? [initialYogaServices[0].sys.id] : []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<Availability>({});
  const [customHour, setCustomHour] = useState<string>('');
  const [customMinute, setCustomMinute] = useState<string>('');
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('AM');
  const [bulkCustomHour, setBulkCustomHour] = useState<string>('');
  const [bulkCustomMinute, setBulkCustomMinute] = useState<string>('');
  const [bulkCustomPeriod, setBulkCustomPeriod] = useState<'AM' | 'PM'>('AM');
  const [activeTab, setActiveTab] = useState<string>('single-day');
  const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>(new Date());
  const [bulkEndDate, setBulkEndDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [bulkSelectedDates, setBulkSelectedDates] = useState<Date[]>([]);
  const [bulkExcludedInput, setBulkExcludedInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedBulkTimeSlots, setSelectedBulkTimeSlots] = useState<string[]>([]);
  const [selectedSingleTimeSlots, setSelectedSingleTimeSlots] = useState<string[]>([]);
  const [commonTimeSlots, setCommonTimeSlots] = useState<string[]>(() =>
    sortTimeStrings([
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ])
  );
  const [serviceSelectionTab, setServiceSelectionTab] = useState<string>(initialYogaServices.length > 0 ? initialYogaServices[0].sys.id : 'multi-select');

  useEffect(() => {
    const storedTimeSlots = localStorage.getItem('commonTimeSlots');
    if (storedTimeSlots) {
      setCommonTimeSlots(sortTimeStrings(JSON.parse(storedTimeSlots)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('commonTimeSlots', JSON.stringify(commonTimeSlots));
  }, [commonTimeSlots]);

  useEffect(() => {
    if (selectedServiceIds.length > 0) {
      loadAvailability();
    } else {
      setAvailability({});
    }
  }, [selectedServiceIds]);

  const loadAvailability = async () => {
    if (selectedServiceIds.length === 0) return;

    try {
      const availabilityPromises = selectedServiceIds.map(id =>
        fetch(`/api/yoga-availability?serviceId=${id}`).then(res => res.json())
      );
      const results = await Promise.all(availabilityPromises);

      const combinedAvailability: Availability = {};
      results.forEach((result, index) => {
        if (result.success) {
          combinedAvailability[selectedServiceIds[index]] = result.data;
        } else {
          console.error(`Failed to load availability for service ${selectedServiceIds[index]}:`, result.error);
        }
      });
      setAvailability(combinedAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
      setAvailability({});
    }
  };

  const displayedAvailableSlots = useMemo(() => {
    if (!selectedDate || selectedServiceIds.length === 0) return [];

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    if (selectedServiceIds.length === 1) {
      const serviceId = selectedServiceIds[0];
      const serviceAvailability = availability[serviceId];
      return serviceAvailability && serviceAvailability[formattedDate]
        ? Object.keys(serviceAvailability[formattedDate]).filter(time => serviceAvailability[formattedDate][time] === 'available')
        : [];
    }

    // Intersection for multiple services
    const allSlots = selectedServiceIds.map(id => {
      const serviceAvailability = availability[id];
      return serviceAvailability && serviceAvailability[formattedDate]
        ? Object.keys(serviceAvailability[formattedDate]).filter(time => serviceAvailability[formattedDate][time] === 'available')
        : [];
    });

    return allSlots.reduce((acc, slots) => intersection(acc, slots));
  }, [availability, selectedDate, selectedServiceIds]);

  const updateAvailabilityAction = async (
    timeSlots: string[],
    action: 'add' | 'remove',
    options?: { dateRange?: { from: Date; to: Date }; dates?: Date[] }
  ) => {
    if (selectedServiceIds.length === 0) return;

    setIsSaving(true);
    try {
      const datesToApply: Date[] = options?.dates && options.dates.length > 0
        ? options.dates
        : [];

      // If specific dates were provided, apply one-by-one
      if (datesToApply.length > 0) {
        for (const date of datesToApply) {
          const body = {
            serviceIds: selectedServiceIds,
            timeSlots,
            action,
            date: date.toISOString(),
          };
          // eslint-disable-next-line no-await-in-loop
          const response = await fetch('/api/yoga-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          // eslint-disable-next-line no-await-in-loop
          const result = await response.json();
          if (!result.success) {
            console.error('Failed to update availability for date:', date, result);
          }
        }
      } else {
        const body: {
          serviceIds: string[];
          timeSlots: string[];
          action: 'add' | 'remove';
          date?: string;
          dateRange?: { from: string; to: string };
        } = {
          serviceIds: selectedServiceIds,
          timeSlots,
          action,
        };

        if (options?.dateRange && options.dateRange.from && options.dateRange.to) {
          body.dateRange = {
            from: options.dateRange.from.toISOString(),
            to: options.dateRange.to.toISOString(),
          };
        } else if (selectedDate) {
          body.date = selectedDate.toISOString();
        } else {
          return;
        }

        const response = await fetch('/api/yoga-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!result.success) {
          console.error('Failed to update availability:', result);
          alert(`Failed to update availability.`);
          return;
        }
      }

      await loadAvailability();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Error updating availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomTimeSlot = (isBulk: boolean) => {
    const hourStr = isBulk ? bulkCustomHour : customHour;
    const minuteStr = isBulk ? bulkCustomMinute : customMinute;
    const period = isBulk ? bulkCustomPeriod : customPeriod;

    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      alert('Please enter a valid time in 12-hour format (HH:MM AM/PM)');
      return;
    }

    const hour24 = period === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    const timeString24 = `${hour24.toString().padStart(2, '0')}:${minuteStr.padStart(2, '0')}`;

    if (commonTimeSlots.includes(timeString24)) {
      alert('This time slot already exists.');
      return;
    }

    const newCommonTimeSlots = sortTimeStrings([...commonTimeSlots, timeString24]);
    setCommonTimeSlots(newCommonTimeSlots);

    if (isBulk) {
      setBulkCustomHour('');
      setBulkCustomMinute('');
      setBulkCustomPeriod('AM');
    } else {
      updateAvailabilityAction([timeString24], 'add');
      setCustomHour('');
      setCustomMinute('');
      setCustomPeriod('AM');
    }
  };

  const handleBulkUpdate = async () => {
    const dates = getBulkDates();
    if (dates.length === 0 || selectedBulkTimeSlots.length === 0) {
      alert('Please select dates and at least one time slot.');
      return;
    }

    await updateAvailabilityAction(selectedBulkTimeSlots, 'add', { dates });
  };

  const handleBulkRemove = async () => {
    const dates = getBulkDates();
    if (dates.length === 0 || selectedBulkTimeSlots.length === 0) {
      alert('Please select dates and at least one time slot.');
      return;
    }

    await updateAvailabilityAction(selectedBulkTimeSlots, 'remove', { dates });
  };

  const getBulkDates = () => {
    let dates: Date[] = [];
    if (bulkSelectedDates.length > 0) {
      dates = bulkSelectedDates;
    } else if (bulkStartDate && bulkEndDate) {
      const cursor = new Date(bulkStartDate);
      const end = new Date(bulkEndDate);
      while (cursor <= end) {
        dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const excluded = (bulkExcludedInput || '')
      .split(/[\n,]+/)
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => new Date(d));

    if (excluded.length) {
      const excludedKeys = new Set(excluded.map((d) => format(d, 'yyyy-MM-dd')));
      dates = dates.filter((d) => !excludedKeys.has(format(d, 'yyyy-MM-dd')));
    }

    // Deduplicate by date string
    const seen = new Set<string>();
    dates = dates.filter((d) => {
      const key = format(d, 'yyyy-MM-dd');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return dates;
  };

  const handleServiceTabChange = (value: string) => {
    setServiceSelectionTab(value);
    if (value === 'multi-select') {
      setSelectedServiceIds([]);
    } else {
      setSelectedServiceIds([value]);
    }
  };

  const handleMultiSelectChange = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const addSelectedTimeSlots = () => updateAvailabilityAction(selectedSingleTimeSlots, 'add');
  const removeSelectedTimeSlots = () => updateAvailabilityAction(selectedSingleTimeSlots, 'remove');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Services</CardTitle>
          <CardDescription>Choose a service or multiple services to manage availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={serviceSelectionTab} onValueChange={handleServiceTabChange}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.sys.id} value={service.sys.id}>
                    {service.name}
                  </SelectItem>
                ))}
                <SelectItem value="multi-select">Multi-Select Services</SelectItem>
              </SelectContent>
            </Select>

            {serviceSelectionTab === 'multi-select' && (
              <div className="pt-2">
                <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                  {services.map(service => (
                    <div key={service.sys.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border-muted bg-surface hover:bg-surface-alt transition-colors">
                      <Checkbox
                        id={`service-${service.sys.id}`}
                        checked={selectedServiceIds.includes(service.sys.id)}
                        onCheckedChange={() => handleMultiSelectChange(service.sys.id)}
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`service-${service.sys.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium"
                      >
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="single-day" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single-day" disabled={selectedServiceIds.length === 0}>Single Day Management</TabsTrigger>
          <TabsTrigger value="bulk-dates" disabled={selectedServiceIds.length === 0}>Bulk Date Management</TabsTrigger>
          <TabsTrigger value="weekly-schedule" disabled={selectedServiceIds.length === 0}>Weekly Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="single-day" className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto sm:overflow-visible">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={selectedServiceIds.length === 0}
                    className="mx-auto"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Manage Availability</CardTitle>
                {selectedDate && <CardDescription>Managing times for {format(selectedDate, 'MMMM d, yyyy')}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Available Times</h4>
                    <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                      {displayedAvailableSlots.length > 0 ? (
                        sortTimeStrings(displayedAvailableSlots).map(slot => (
                          <Badge key={slot} variant="default">{to12HourFormat(slot)}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No common slots</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <TimeSlotSelector
                    commonTimeSlots={commonTimeSlots}
                    selectedSlots={selectedSingleTimeSlots}
                    onToggleSlot={(slot) => setSelectedSingleTimeSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])}
                    title="Select Time Slots"
                    description="Add or remove time slots for the selected date."
                  />
                  <div className="flex gap-2">
                    <Button onClick={addSelectedTimeSlots} disabled={selectedSingleTimeSlots.length === 0 || isSaving}>Add</Button>
                    <Button onClick={removeSelectedTimeSlots} variant="outline" disabled={selectedSingleTimeSlots.length === 0 || isSaving}>Remove</Button>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-beauty-dark mb-3">
                      Add Custom Time Slot
                    </h4>
                    <div className="flex space-x-2 items-end">
                      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                        <div className="space-y-1">
                          <Label htmlFor="custom-hour">Hour</Label>
                          <Input id="custom-hour" type="number" placeholder="1-12" min="1" max="12" value={customHour} onChange={(e) => setCustomHour(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="custom-minute">Minute</Label>
                          <Input id="custom-minute" type="number" placeholder="00-59" min="0" max="59" value={customMinute} onChange={(e) => setCustomMinute(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="custom-period">Period</Label>
                          <Select value={customPeriod} onValueChange={(value: 'AM' | 'PM') => setCustomPeriod(value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={() => handleAddCustomTimeSlot(false)} disabled={isSaving}>Add</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk-dates" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Date Management</CardTitle>
              <CardDescription>Set availability for multiple dates at once.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Specific Dates (optional)</Label>
                  <Calendar
                    mode="multiple"
                    selected={bulkSelectedDates}
                    onSelect={(dates) => setBulkSelectedDates(dates || [])}
                    className="rounded-md border"
                  />
                  <p className="text-xs text-text-muted">
                    Pick multiple dates here, or use the date range to apply continuously.
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>Date Range (optional)</Label>
                    <div className="flex items-center space-x-2">
                      <Input type="date" value={bulkStartDate ? format(bulkStartDate, 'yyyy-MM-dd') : ''} onChange={(e) => setBulkStartDate(e.target.value ? new Date(e.target.value) : undefined)} />
                      <span>to</span>
                      <Input type="date" value={bulkEndDate ? format(bulkEndDate, 'yyyy-MM-dd') : ''} onChange={(e) => setBulkEndDate(e.target.value ? new Date(e.target.value) : undefined)} />
                    </div>
                    <p className="text-xs text-text-muted mt-1">If specific dates are selected, the range will be ignored.</p>
                  </div>
                  <div>
                    <Label>Exclude Dates (optional)</Label>
                    <Textarea
                      placeholder="2025-02-10, 2025-02-12 or one per line"
                      value={bulkExcludedInput}
                      onChange={(e) => setBulkExcludedInput(e.target.value)}
                      className="min-h-[90px]"
                    />
                    <p className="text-xs text-text-muted mt-1">Excluded dates are removed from the selection.</p>
                  </div>
                </div>
              </div>
              <Separator />
              <TimeSlotSelector
                commonTimeSlots={commonTimeSlots}
                selectedSlots={selectedBulkTimeSlots}
                onToggleSlot={(slot) => setSelectedBulkTimeSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])}
                title="Select Time Slots to Add"
                description="These time slots will be added to all dates in the selected range."
              />
              <div>
                <h4 className="font-medium text-beauty-dark mb-4">
                  Add Custom Time Slot
                </h4>
                <div className="flex space-x-2 items-end">
                  <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                    <div className="space-y-1">
                      <Label htmlFor="bulk-custom-hour">Hour</Label>
                      <Input id="bulk-custom-hour" type="number" placeholder="1-12" min="1" max="12" value={bulkCustomHour} onChange={(e) => setBulkCustomHour(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bulk-custom-minute">Minute</Label>
                      <Input id="bulk-custom-minute" type="number" placeholder="00-59" min="0" max="59" value={bulkCustomMinute} onChange={(e) => setBulkCustomMinute(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bulk-custom-period">Period</Label>
                      <Select value={bulkCustomPeriod} onValueChange={(value: 'AM' | 'PM') => setBulkCustomPeriod(value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => handleAddCustomTimeSlot(true)} disabled={isSaving}>Add to List</Button>
                </div>
              </div>
              <Button onClick={handleBulkUpdate} className="w-full" disabled={isSaving}>
                {isSaving ? 'Updating...' : 'Update All Selected Dates'}
              </Button>
              {showSuccessMessage && <p className="text-sm text-green-600">Bulk update successful!</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly-schedule" className="space-y-6 pt-4">
          <WeeklyScheduleTab
            commonTimeSlots={commonTimeSlots}
            onUpdateAvailability={updateAvailabilityAction}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
