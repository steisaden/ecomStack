import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyScheduleTabProps {
    commonTimeSlots: string[];
    onUpdateAvailability: (
        timeSlots: string[],
        action: 'add' | 'remove',
        options?: { dateRange?: { from: Date; to: Date }; dates?: Date[] }
    ) => Promise<void>;
    isSaving: boolean;
}

export function WeeklyScheduleTab({ commonTimeSlots, onUpdateAvailability, isSaving }: WeeklyScheduleTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                    Set a recurring schedule for each day of the week.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Weekly schedule settings will appear here.</p>
                {/* Placeholder for future implementation */}
            </CardContent>
        </Card>
    );
}
