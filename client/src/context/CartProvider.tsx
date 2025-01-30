import { createContext, ReactElement, useMemo, useReducer } from "react";
import { CartItem } from "../types/CartItem";

type CartStateType = { cart: CartItem[] };

const initCartState: CartStateType = { cart: [] };

const REDUCER_ACTION_TYPE = {
    ADD: "ADD",
    REMOVE: "REMOVE",
    QUANTITY: "QUANTITY",
    SUBMIT: "SUBMIT",
}

export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

export type ReducerAction = {
    type: string,
    payload?: CartItem,
}

const reducer = (state: CartStateType, action: ReducerAction): CartStateType => {
    switch (action.type) {
        case REDUCER_ACTION_TYPE.ADD: {
            if (!action.payload) {
                throw new Error("action.payload is required in ADD action");
            }
            const { _id, name, price, description, weight, category } = action.payload;
            
            const filteredCart: CartItem[] = state.cart.filter(item => item._id !== _id)

            const itemExists: CartItem | undefined = state.cart.find(item => item._id === _id)

            const amount: number = itemExists ? itemExists.amount + 1 : 1

            return { ...state, cart: [...filteredCart, { _id, name, price, description, weight, category, amount }] }
        }
        case REDUCER_ACTION_TYPE.REMOVE: {
            if (!action.payload) {
                throw new Error("action.payload is required in REMOVE action");
            }

            const { _id } = action.payload

            const filteredCart: CartItem[] = state.cart.filter(item => item._id !== _id)

            return { ...state, cart: [...filteredCart] }
        }
        case REDUCER_ACTION_TYPE.QUANTITY: {
            if (!action.payload) {
                throw new Error("action.payload is required in QUANTITY action");
            }
            const { _id, amount } = action.payload

            const itemExists: CartItem | undefined = state.cart.find(item => item._id === _id)

            if (!itemExists) {
                throw new Error('Item must exist in order to update quantity')
            }

            const updatedItem: CartItem = { ...itemExists, amount }

            const filteredCart: CartItem[] = state.cart.filter(item => item._id !== _id)

            return { ...state, cart: [...filteredCart, updatedItem] }
        }
        case REDUCER_ACTION_TYPE.SUBMIT:
            return { ...state, cart: [] };
        default:
            throw new Error("Invalid action type");
    }
};

const useCartContext = (initCartState: CartStateType) => {
    const [state, dispatch] = useReducer(reducer, initCartState)

    const REDUCER_ACTIONS = useMemo(() => {
        return REDUCER_ACTION_TYPE
    }, [])

    const totalItems = state.cart.reduce((previousValue, cartItem) => {
        return previousValue + cartItem.amount
    }, 0)

    const totalPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        state.cart.reduce((previousValue, cartItem) => {
            return previousValue + (cartItem.amount * cartItem.price)
        }, 0)
    )

    const cart = state.cart.sort((a, b) => {
        const itemA = a.name.toLowerCase()
        const itemB = b.name.toLowerCase()
        if (itemA < itemB) return -1
        if (itemA > itemB) return 1
        return 0
    })

    return { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart }
}

export type UseCartContextType = ReturnType<typeof useCartContext>

const initCartContextState: UseCartContextType = {
    dispatch: () => { },
    REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
    totalItems: 0,
    totalPrice: '',
    cart: [],
}

const CartContext = createContext<UseCartContextType>(initCartContextState)

type ChildrenType = { children?: ReactElement | ReactElement[] }

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
    return (
        <CartContext.Provider value={useCartContext(initCartState)}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext;
