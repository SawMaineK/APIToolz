import { Fragment, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Demo1LightSidebarContent } from '../light-sidebar';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownChatAI } from '@/partials/dropdowns/chat-ai';
import { useLanguage } from '@/i18n';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { Cpu } from 'lucide-react';
import axios from 'axios';

const Demo1DarkSidebarPage = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [placeholder, setPlaceholder] = useState(false);
  const { isRTL } = useLanguage();

  const itemAIChatRef = useRef<any>(null);

  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  useEffect(() => {
    fetchSummaryWidgets('default_settings');
  }, [date]);

  const fetchSummaryWidgets = async (key: string) => {
    try {
      const start_date = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
      const end_date = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/appsetting/summary`, {
        params: {
          key,
          start_date,
          end_date
        }
      });
      setWidgets(response.data.reports);
      setPlaceholder(response.data.reports.length == 0);
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading title="Dashboard" description="Central Hub for Personal Customization" />
          <ToolbarActions>
            <Menu>
              <MenuItem
                ref={itemAIChatRef}
                onShow={handleShow}
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? 'bottom-start' : 'bottom-end',
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: isRTL() ? [-170, 10] : [50, -100]
                      }
                    }
                  ]
                }}
              >
                <MenuToggle className="btn btn-sm btn-primary">
                  <Cpu size={16} />
                  AI Assist
                </MenuToggle>

                {DropdownChatAI({
                  menuTtemRef: itemAIChatRef,
                  slug: 'dashboard',
                  type: 'dashboard'
                })}
              </MenuItem>
            </Menu>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="date"
                  className={cn(
                    'btn btn-sm btn-light data-[state=open]:bg-light-active',
                    !date && 'text-gray-400'
                  )}
                >
                  <KeenIcon icon="calendar" className="me-0.5" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <Demo1LightSidebarContent widgets={widgets} showPlaceholder={placeholder} />
      </Container>
    </Fragment>
  );
};

export { Demo1DarkSidebarPage };
