import { createContext, useContext, useReducer, ReactNode } from 'react';

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface YogaService {
  id: string;
  name: string;
  price: number;
  duration: number;
  date: string;
  time: string;
}

interface CartItem {
  service: YogaService;
  addOns: AddOn[];
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_SERVICE'; payload: YogaService }
  | { type: 'REMOVE_SERVICE'; payload: string }
  | { type: 'ADD_ADDON'; payload: { serviceId: string; addOn: AddOn } }
  | { type: 'REMOVE_ADDON'; payload: { serviceId: string; addOnId: string } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0
};

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const servicePrice = item.service.price;
    const addOnsPrice = item.addOns.reduce((sum, addon) => sum + addon.price, 0);
    return total + servicePrice + addOnsPrice;
  }, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_SERVICE':
      if (state.items.some(item => item.service.id === action.payload.id)) {
        return state;
      }
      const newItems = [...state.items, { service: action.payload, addOns: [] }];
      return {
        items: newItems,
        total: calculateTotal(newItems)
      };

    case 'REMOVE_SERVICE':
      const filteredItems = state.items.filter(
        item => item.service.id !== action.payload
      );
      return {
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };

    case 'ADD_ADDON':
      const itemsWithNewAddon = state.items.map(item =>
        item.service.id === action.payload.serviceId
          ? {
              ...item,
              addOns: [...item.addOns, action.payload.addOn]
            }
          : item
      );
      return {
        items: itemsWithNewAddon,
        total: calculateTotal(itemsWithNewAddon)
      };

    case 'REMOVE_ADDON':
      const itemsWithoutAddon = state.items.map(item =>
        item.service.id === action.payload.serviceId
          ? {
              ...item,
              addOns: item.addOns.filter(
                addon => addon.id !== action.payload.addOnId
              )
            }
          : item
      );
      return {
        items: itemsWithoutAddon,
        total: calculateTotal(itemsWithoutAddon)
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

interface BookingCartContextType {
  state: CartState;
  addService: (service: YogaService) => void;
  removeService: (serviceId: string) => void;
  addAddOn: (serviceId: string, addOn: AddOn) => void;
  removeAddOn: (serviceId: string, addOnId: string) => void;
  clearCart: () => void;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(
  undefined
);

export function BookingCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addService = (service: YogaService) => {
    dispatch({ type: 'ADD_SERVICE', payload: service });
  };

  const removeService = (serviceId: string) => {
    dispatch({ type: 'REMOVE_SERVICE', payload: serviceId });
  };

  const addAddOn = (serviceId: string, addOn: AddOn) => {
    dispatch({
      type: 'ADD_ADDON',
      payload: { serviceId, addOn }
    });
  };

  const removeAddOn = (serviceId: string, addOnId: string) => {
    dispatch({
      type: 'REMOVE_ADDON',
      payload: { serviceId, addOnId }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <BookingCartContext.Provider
      value={{
        state,
        addService,
        removeService,
        addAddOn,
        removeAddOn,
        clearCart
      }}
    >
      {children}
    </BookingCartContext.Provider>
  );
}

export function useBookingCart() {
  const context = useContext(BookingCartContext);
  if (context === undefined) {
    throw new Error('useBookingCart must be used within a BookingCartProvider');
  }
  return context;
}