import React, { useState, useEffect } from 'react';
import {
	ShoppingBag,
	X,
	Star,
	Heart,
	ChevronRight,
	Menu,
	Search,
	Plus,
	Minus,
	User,
	ArrowLeft,
	CreditCard,
	CheckCircle,
	MapPin,
	Truck,
	Smartphone,
	Gift,
	MessageSquare,
	Clock,
	Trash2,
	Calendar,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
	getAuth,
	signInAnonymously,
	onAuthStateChanged,
	signInWithCustomToken,
} from 'firebase/auth';
import {
	getFirestore,
	collection,
	getDocs,
	addDoc,
	query,
	orderBy,
	serverTimestamp,
} from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = {
	apiKey: 'AIzaSyD6UzORb2Jkl1YTcYNmjyT6-poszLHoTck',
	authDomain: 'bliss-bakes.firebaseapp.com',
	databaseURL: 'https://bliss-bakes-default-rtdb.firebaseio.com',
	projectId: 'bliss-bakes',
	storageBucket: 'bliss-bakes.firebasestorage.app',
	messagingSenderId: '842264204266',
	appId: '1:842264204266:web:ca8c9d5dc457addfa85893',
	measurementId: 'G-XCZRV071N8',
};
const app = initializeApp(firebaseConfig);
if (typeof window !== 'undefined') {
	try {
		getAnalytics(app);
	} catch (analyticsError) {
		console.warn('Analytics initialization skipped.', analyticsError);
	}
}
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof globalThis !== 'undefined' && '__app_id' in globalThis ? globalThis.__app_id : 'default-app-id';
const initialAuthToken =
	typeof globalThis !== 'undefined' && '__initial_auth_token' in globalThis
		? globalThis.__initial_auth_token
		: null;

// --- Initial Data ---
const INITIAL_PRODUCTS = [
	{
		id: 1,
		name: 'Royal Raspberry Layer Cake',
		category: 'Cakes',
		price: 28.0,
		image:
			'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
		description:
			'Layers of fluffy vanilla sponge with fresh raspberry coulis and white chocolate buttercream.',
		popular: true,
	},
	{
		id: 2,
		name: 'Golden Butter Croissant',
		category: 'Pastries',
		price: 4.5,
		image:
			'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
		description: 'Hand-rolled, buttery, and baked to a golden crisp. The perfect morning treat.',
		popular: true,
	},
	{
		id: 3,
		name: 'Strawberry Bliss Donut',
		category: 'Pastries',
		price: 3.0,
		image:
			'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
		description: 'Classic yeast donut dipped in real strawberry glaze with a white chocolate drizzle.',
		popular: false,
	},
	{
		id: 4,
		name: 'Rustic Sourdough Loaf',
		category: 'Breads',
		price: 8.5,
		image:
			'https://images.unsplash.com/photo-1585478259525-7c1003897b52?auto=format&fit=crop&w=600&q=80',
		description: 'Crusty on the outside, soft and airy on the inside. Fermented for 48 hours.',
		popular: false,
	},
	{
		id: 5,
		name: 'Velvet Dream Cupcake',
		category: 'Cakes',
		price: 3.75,
		image:
			'https://i.pinimg.com/736x/fc/67/ec/fc67ec3b4bd0e540c67a5b8bba9fbb6a.jpg',
		description: 'Rich red velvet sponge topped with our signature swirl of cream cheese frosting.',
		popular: true,
	},
	{
		id: 6,
		name: 'Double Fudge Cookie',
		category: 'Pastries',
		price: 2.5,
		image:
			'https://images.unsplash.com/photo-1499636138143-bd630f5cfdeb?auto=format&fit=crop&w=600&q=80',
		description: 'Gooey, chewy, and packed with chunks of Belgian chocolate.',
		popular: false,
	},
	{
		id: 7,
		name: 'Blueberry Crumble Muffin',
		category: 'Pastries',
		price: 3.25,
		image:
			'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80',
		description: 'Bursting with fresh blueberries and topped with a buttery sugar crumble.',
		popular: false,
	},
	{
		id: 8,
		name: 'Artisan Baguette',
		category: 'Breads',
		price: 3.5,
		image:
			'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?auto=format&fit=crop&w=600&q=80',
		description: 'Authentic French style baguette with a crisp crust and honeycomb crumb.',
		popular: false,
	},
];

const CATEGORIES = ['All', 'Favorites', 'Cakes', 'Pastries', 'Breads'];

// --- Utility Components ---

const Toast = ({ message, type, show, onClose }) => {
	if (!show) return null;

	const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800';

	return (
		<div
			className={`fixed top-24 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in`}
		>
			{type === 'success' ? <CheckCircle size={20} /> : <Gift size={20} />}
			<span className="font-medium">{message}</span>
			<button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1">
				<X size={14} />
			</button>
		</div>
	);
};

// --- Page Components ---

const AuthView = ({ onLogin, onCancel }) => {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');

	const handleSubmit = (event) => {
		event.preventDefault();
		onLogin({ name: name || 'Sweet Customer', email });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-pink-50 px-4 py-12">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
				<div className="p-8">
					<div className="text-center mb-8">
						<div className="inline-block p-3 bg-pink-100 rounded-full mb-4 text-pink-600">
							<User size={32} />
						</div>
						<h2 className="text-3xl font-black text-gray-800">{isLogin ? 'Welcome Back!' : 'Join Bliss Bakes'}</h2>
						<p className="text-gray-500 mt-2">Sign in to save your favorites and track orders.</p>
					</div>
					<form onSubmit={handleSubmit} className="space-y-6">
						{!isLogin && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
								<input
									type="text"
									required
									value={name}
									onChange={(event) => setName(event.target.value)}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none"
									placeholder="John Dough"
								/>
							</div>
						)}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
							<input
								type="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none"
								placeholder="bakery@lover.com"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
							<input
								type="password"
								required
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none"
								placeholder="••••••••"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-pink-600 active:scale-95 transition-all"
						>
							{isLogin ? 'Sign In' : 'Create Account'}
						</button>
					</form>
					<div className="mt-6 text-center text-sm text-gray-600">
						{isLogin ? "Don't have an account? " : 'Already have an account? '}
						<button onClick={() => setIsLogin(!isLogin)} className="text-pink-600 font-bold hover:underline">
							{isLogin ? 'Sign Up' : 'Log In'}
						</button>
					</div>
					<button onClick={onCancel} className="mt-6 w-full text-gray-400 text-sm hover:text-gray-600">
						Back to Menu
					</button>
				</div>
			</div>
		</div>
	);
};

const OrdersView = ({ user, onBack }) => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) return;

		const fetchOrders = async () => {
			try {
				const ordersQuery = query(
					collection(db, 'artifacts', appId, 'users', user.uid, 'orders'),
					orderBy('createdAt', 'desc'),
				);
				const snapshot = await getDocs(ordersQuery);
				setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
			} catch (error) {
				console.error('Error fetching orders:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [user]);

	return (
		<div className="min-h-screen bg-gray-50 py-20 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center mb-8">
					<button onClick={onBack} className="p-2 hover:bg-white rounded-full mr-4 transition-colors">
						<ArrowLeft className="text-gray-600" />
					</button>
					<h1 className="text-3xl font-black text-gray-900">Order History</h1>
				</div>

				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((item) => (
							<div key={item} className="h-32 bg-white rounded-xl animate-pulse" />
						))}
					</div>
				) : orders.length === 0 ? (
					<div className="text-center py-20 bg-white rounded-2xl shadow-sm">
						<div className="inline-block p-6 bg-pink-50 rounded-full mb-4">
							<ShoppingBag className="text-pink-400" size={48} />
						</div>
						<h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
						<p className="text-gray-500 mb-6">Looks like you haven't indulged in our treats yet!</p>
						<button
							onClick={onBack}
							className="bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-pink-600"
						>
							Start Shopping
						</button>
					</div>
				) : (
					<div className="space-y-6">
						{orders.map((order) => (
							<div
								key={order.id}
								className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-slide-up"
							>
								<div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-50">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
												{order.status || 'Completed'}
											</span>
											<span className="text-gray-400 text-sm flex items-center gap-1">
												<Calendar size={14} />
												{order.createdAt?.seconds
													? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
													: 'Just now'}
											</span>
										</div>
										<p className="text-xs text-gray-400 uppercase tracking-widest">
											Order #{order.id.slice(0, 8)}
										</p>
									</div>
									<div className="text-right mt-2 md:mt-0">
										<p className="text-xl font-black text-gray-900">${order.total.toFixed(2)}</p>
										<p className="text-xs text-gray-500">{order.items.length} items</p>
									</div>
								</div>
								<div className="space-y-3">
									{order.items.map((item, idx) => (
										<div key={idx} className="flex items-center gap-4">
											<div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
												<img src={item.image} alt={item.name} className="w-full h-full object-cover" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
												<p className="text-gray-500 text-xs">
													Qty: {item.quantity} × ${item.price}
												</p>
											</div>
										</div>
									))}
								</div>
								{order.note && (
									<div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800 flex gap-2">
										<MessageSquare size={14} className="mt-0.5" />
										<span className="italic">"{order.note}"</span>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

const CheckoutView = ({ cart, subtotal, onBack, onCompleteOrder, showToast }) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState('card');
	const [note, setNote] = useState('');
	const [promoCode, setPromoCode] = useState('');
	const [discount, setDiscount] = useState(0);

	const handleApplyPromo = () => {
		if (promoCode.toUpperCase() === 'SWEET20') {
			setDiscount(0.2);
			showToast('Code SWEET20 applied! You saved 20%', 'success');
		} else {
			setDiscount(0);
			showToast('Invalid promo code', 'error');
		}
	};

	const finalTotal = subtotal * (1 - discount) + 5 + subtotal * 0.05;

	const handlePay = (event) => {
		event.preventDefault();
		setIsProcessing(true);
		setTimeout(() => {
			setIsProcessing(false);
			onCompleteOrder(paymentMethod, note, finalTotal);
		}, 2000);
	};

	if (cart.length === 0) {
		return (
			<div className="p-10 text-center">
				<button onClick={onBack}>Go Back</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-20 px-4">
			<div className="max-w-6xl mx-auto">
				<button
					onClick={onBack}
					className="flex items-center text-gray-500 hover:text-pink-600 mb-8 transition-colors"
				>
					<ArrowLeft size={20} className="mr-2" /> Back to Menu
				</button>

				<h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

				<div className="grid lg:grid-cols-2 gap-12">
					<div className="space-y-8 animate-slide-up">
						<div className="bg-white p-6 rounded-2xl shadow-sm">
							<div className="flex items-center gap-3 mb-6">
								<MapPin className="text-pink-500" />
								<h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
							</div>
							<form className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<input
										type="text"
										placeholder="First Name"
										className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
									/>
									<input
										type="text"
										placeholder="Last Name"
										className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
									/>
								</div>
								<input
									type="text"
									placeholder="Address"
									className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
								/>
							</form>
						</div>

						<div className="bg-white p-6 rounded-2xl shadow-sm">
							<div className="flex items-center gap-3 mb-4">
								<MessageSquare className="text-pink-500" />
								<h2 className="text-xl font-bold text-gray-800">Note to Baker</h2>
							</div>
							<textarea
								value={note}
								onChange={(event) => setNote(event.target.value)}
								placeholder="Allergies? Special birthday message? Let us know!"
								className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500 h-24 resize-none"
							/>
						</div>

						<div className="bg-white p-6 rounded-2xl shadow-sm">
							<div className="flex items-center gap-3 mb-6">
								{paymentMethod === 'card' ? (
									<CreditCard className="text-pink-500" />
								) : (
									<Smartphone className="text-pink-500" />
								)}
								<h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
							</div>

							<div className="flex gap-4 mb-6">
								<button
									type="button"
									onClick={() => setPaymentMethod('card')}
									className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 ${
										paymentMethod === 'card' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200'
									}`}
								>
									<CreditCard size={24} /> <span className="font-bold text-sm">Card</span>
								</button>
								<button
									type="button"
									onClick={() => setPaymentMethod('upi')}
									className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 ${
										paymentMethod === 'upi' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200'
									}`}
								>
									<Smartphone size={24} /> <span className="font-bold text-sm">UPI</span>
								</button>
							</div>

							<form id="checkout-form" onSubmit={handlePay}>
								{paymentMethod === 'card' ? (
									<div className="space-y-4">
										<input
											type="text"
											placeholder="Card Number"
											required
											className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
										/>
										<div className="grid grid-cols-2 gap-4">
											<input
												type="text"
												placeholder="MM/YY"
												required
												className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
											/>
											<input
												type="text"
												placeholder="CVC"
												required
												className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
											/>
										</div>
									</div>
								) : (
									<div>
										<input
											type="text"
											placeholder="UPI ID (e.g. name@bank)"
											required
											className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-pink-500"
										/>
									</div>
								)}
							</form>
						</div>
					</div>

					<div className="lg:pl-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
						<div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24 border border-pink-100">
							<h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
							<div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 custom-scrollbar">
								{cart.map((item) => (
									<div key={item.id} className="flex gap-4 items-center">
										<img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
										<div className="flex-1">
											<h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
											<p className="text-gray-500 text-sm">
												${item.price.toFixed(2)} x {item.quantity}
											</p>
										</div>
										<p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
									</div>
								))}
							</div>

							<div className="flex gap-2 mb-6">
								<input
									type="text"
									value={promoCode}
									onChange={(event) => setPromoCode(event.target.value)}
									placeholder="Promo Code"
									className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none text-sm uppercase"
								/>
								<button
									type="button"
									onClick={handleApplyPromo}
									className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700"
								>
									Apply
								</button>
							</div>

							<div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
								<div className="flex justify-between text-gray-600">
									<span>Subtotal</span>
									<span>${subtotal.toFixed(2)}</span>
								</div>
								{discount > 0 && (
									<div className="flex justify-between text-green-600 font-medium">
										<span>Discount (20%)</span>
										<span>-${(subtotal * discount).toFixed(2)}</span>
									</div>
								)}
								<div className="flex justify-between text-gray-600">
									<span>Delivery Fee</span>
									<span>$5.00</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>Tax (5%)</span>
									<span>${(subtotal * 0.05).toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-gray-100">
									<span>Total</span>
									<span>${finalTotal.toFixed(2)}</span>
								</div>
							</div>

							<button
								type="button"
								onClick={() => document.getElementById('checkout-form')?.requestSubmit()}
								disabled={isProcessing}
								className={`w-full mt-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
									isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 active:scale-95'
								}`}
							>
								{isProcessing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const SuccessView = ({ onHome }) => (
	<div className="min-h-screen flex items-center justify-center bg-white p-4">
		<div className="text-center max-w-lg animate-slide-up">
			<div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
				<CheckCircle className="text-green-500" size={48} />
			</div>
			<h1 className="text-4xl font-black text-gray-900 mb-4">Order Confirmed!</h1>
			<p className="text-lg text-gray-500 mb-8">
				Thank you for your order. We're firing up the ovens! Your treats will be with you shortly.
			</p>
			<button
				onClick={onHome}
				className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-pink-600 transition-all"
			>
				Continue Shopping
			</button>
		</div>
	</div>
);

const CartSidebar = ({ isOpen, onClose, cart, updateQuantity, removeItem, onCheckout }) => {
	const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

	return (
		<div
			className={`fixed inset-0 z-50 transition-opacity duration-300 ${
				isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}
		>
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
			<div
				className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className="p-6 bg-pink-500 text-white flex justify-between items-center shadow-md">
					<h2 className="text-2xl font-bold font-serif">Your Bliss Box</h2>
					<button onClick={onClose} className="p-2 hover:bg-pink-600 rounded-full transition-colors">
						<X size={24} />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{cart.length === 0 ? (
						<div className="text-center text-gray-500 mt-10 flex flex-col items-center">
							<ShoppingBag size={64} className="text-pink-200 mb-4" />
							<p className="text-lg">Your cart is empty!</p>
							<p className="text-sm">Time to add some sweetness.</p>
						</div>
					) : (
						cart.map((item) => (
							<div key={item.id} className="flex gap-4 bg-pink-50 p-4 rounded-xl animate-fade-in">
								<img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
								<div className="flex-1">
									<h3 className="font-bold text-gray-800">{item.name}</h3>
									<p className="text-pink-600 font-medium">${item.price.toFixed(2)}</p>
									<div className="flex items-center mt-2 gap-3">
										<div className="flex items-center bg-white rounded-lg border border-pink-200 shadow-sm">
											<button
												onClick={() => updateQuantity(item.id, -1)}
												className="p-1 hover:bg-pink-100 text-pink-600 rounded-l-lg"
											>
												<Minus size={16} />
											</button>
											<span className="px-2 text-sm font-medium w-6 text-center">{item.quantity}</span>
											<button
												onClick={() => updateQuantity(item.id, 1)}
												className="p-1 hover:bg-pink-100 text-pink-600 rounded-r-lg"
											>
												<Plus size={16} />
											</button>
										</div>
										<button
											onClick={() => removeItem(item.id)}
											className="text-gray-400 hover:text-red-500 text-sm underline ml-auto"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
				{cart.length > 0 && (
					<div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
						<div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-800">
							<span>Subtotal</span>
							<span>${total.toFixed(2)}</span>
						</div>
						<button
							onClick={() => {
								onClose();
								onCheckout();
							}}
							className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-pink-600 active:scale-95 transition-all flex items-center justify-center gap-2"
						>
							Checkout Now <ChevronRight size={20} />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

const ProductCard = ({ product, onAdd, isFavorite, onToggleFavorite }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="relative h-56 overflow-hidden">
				<img
					src={product.image}
					alt={product.name}
					className={`w-full h-full object-cover transition-transform duration-700 ${
						isHovered ? 'scale-110' : 'scale-100'
					}`}
				/>
				{product.popular && (
					<div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce-slow">
						<Star size={12} fill="currentColor" /> Bestseller
					</div>
				)}
				<button
					onClick={(event) => {
						event.stopPropagation();
						onToggleFavorite(product.id);
					}}
					className={`absolute top-4 right-4 p-2 rounded-full transition-all shadow-sm ${
						isFavorite ? 'bg-pink-500 text-white' : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-white'
					}`}
				>
					<Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
				</button>
			</div>
			<div className="p-5">
				<div className="text-xs text-pink-500 font-bold tracking-wider uppercase mb-1">
					{product.category}
				</div>
				<h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
					{product.name}
				</h3>
				<p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
				<div className="flex items-center justify-between">
					<span className="text-xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
					<button
						onClick={() => onAdd(product)}
						className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-90 shadow-md flex items-center gap-2"
					>
						Add <Plus size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};

const FloatingDonut = ({ delay, left, size }) => (
	<div
		className="absolute pointer-events-none opacity-20"
		style={{ left: `${left}%`, animation: `float 6s ease-in-out infinite`, animationDelay: `${delay}s`, top: '-50px' }}
	>
		<div className="rounded-full border-8 border-pink-300" style={{ width: size, height: size }}></div>
	</div>
);

export default function BlissBakesApp() {
	const [products, setProducts] = useState([]);
	const [cart, setCart] = useState([]);
	const [favorites, setFavorites] = useState(new Set());
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [activeCategory, setActiveCategory] = useState('All');
	const [searchTerm, setSearchTerm] = useState('');
	const [scrolled, setScrolled] = useState(false);
	const [user, setUser] = useState(null);
	const [currentView, setCurrentView] = useState('home');

	const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
	const showToast = (message, type = 'info') => {
		setToast({ show: true, message, type });
		setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
	};

	useEffect(() => {
		const initAuth = async () => {
			if (initialAuthToken) {
				await signInWithCustomToken(auth, initialAuthToken);
			} else {
				await signInAnonymously(auth);
			}
		};
		initAuth();
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser ? { ...firebaseUser, name: firebaseUser.displayName || 'Guest Baker' } : null);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!user) return;
		const fetchProducts = async () => {
			const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
			try {
				const snapshot = await getDocs(productsRef);
				if (snapshot.empty) {
					await Promise.all(INITIAL_PRODUCTS.map((product) => addDoc(productsRef, product)));
					setProducts(INITIAL_PRODUCTS);
				} else {
					setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
				}
			} catch (error) {
				console.error('Falling back to seeded products', error);
				setProducts(INITIAL_PRODUCTS);
			}
		};
		fetchProducts();
	}, [user]);

	const handleSaveOrder = async (paymentMethod, note, finalTotal) => {
		if (!user) return;
		const orderData = {
			items: cart,
			total: finalTotal,
			status: 'confirmed',
			paymentMethod,
			note,
			createdAt: serverTimestamp(),
		};
		try {
			await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderData);
			setCart([]);
			setCurrentView('success');
			showToast('Order placed successfully!', 'success');
		} catch (error) {
			console.error('Failed to save order', error);
			showToast('Failed to save order', 'error');
		}
	};

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const addToCart = (product) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.id === product.id);
			if (existing) {
				return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
			}
			return [...prev, { ...product, quantity: 1 }];
		});
		setIsCartOpen(true);
		showToast(`Added ${product.name} to cart`, 'success');
	};

	const toggleFavorite = (id) => {
		setFavorites((prev) => {
			const newFavorites = new Set(prev);
			if (newFavorites.has(id)) {
				newFavorites.delete(id);
				showToast('Removed from favorites', 'info');
			} else {
				newFavorites.add(id);
				showToast('Added to favorites', 'success');
			}
			return newFavorites;
		});
	};

	const filteredProducts = products.filter((product) => {
		const matchesCategory =
			activeCategory === 'All'
				? true
				: activeCategory === 'Favorites'
				? favorites.has(product.id)
				: product.category === activeCategory;
		const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	if (currentView === 'login') {
		return (
			<AuthView
				onLogin={(data) => {
					setUser((current) => ({ ...(current || {}), ...data }));
					setCurrentView('home');
				}}
				onCancel={() => setCurrentView('home')}
			/>
		);
	}

	if (currentView === 'orders') {
		return <OrdersView user={user} onBack={() => setCurrentView('home')} />;
	}

	if (currentView === 'checkout') {
		return (
			<CheckoutView
				cart={cart}
				subtotal={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
				onBack={() => setCurrentView('home')}
				onCompleteOrder={handleSaveOrder}
				showToast={showToast}
			/>
		);
	}

	if (currentView === 'success') {
		return <SuccessView onHome={() => setCurrentView('home')} />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white font-sans text-gray-800 overflow-x-hidden">
			<style>{`
				@keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(20px) rotate(10deg); } }
				@keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
				@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
				.animate-float { animation: float 6s ease-in-out infinite; }
				.animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
				.animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
				.animate-fade-in { animation: slide-up 0.3s ease-out forwards; }
				::-webkit-scrollbar { width: 8px; }
				::-webkit-scrollbar-track { background: #fdf2f8; }
				::-webkit-scrollbar-thumb { background: #ec4899; border-radius: 4px; }
			`}</style>

			<Toast {...toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />

			<nav
				className={`fixed w-full z-40 transition-all duration-300 ${
					scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'
				}`}
			>
				<div className="container mx-auto px-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="bg-pink-500 p-2 rounded-lg text-white">
							<Star fill="currentColor" size={20} className="animate-spin-slow" />
						</div>
						<h1 className="text-2xl font-black tracking-tight text-pink-600">
							Bliss<span className="text-gray-800">Bakes</span>
						</h1>
					</div>
					<div className="flex items-center gap-6">
						<div className="hidden md:flex gap-6 font-medium text-gray-600">
							<button onClick={() => setCurrentView('home')} className="hover:text-pink-500 transition-colors">
								Home
							</button>
							<button
								onClick={() => {
									setCurrentView('home');
									document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
								}}
								className="hover:text-pink-500 transition-colors"
							>
								Menu
							</button>
						</div>
						<div className="flex items-center gap-4">
							{user ? (
								<div
									className="hidden md:flex items-center gap-2 text-sm font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100 cursor-pointer hover:bg-pink-100"
									onClick={() => setCurrentView('orders')}
								>
									<User size={16} /> {user.name?.split(' ')[0] || 'Baker'}
								</div>
							) : (
								<button
									onClick={() => setCurrentView('login')}
									className="text-gray-600 hover:text-pink-600 font-medium text-sm"
								>
									Log In
								</button>
							)}
							<button
								onClick={() => setIsCartOpen(true)}
								className="relative bg-white p-3 rounded-full shadow-md hover:shadow-lg hover:text-pink-500 transition-all group"
							>
								<ShoppingBag size={20} />
								{cart.length > 0 && (
									<span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
										{cart.reduce((total, item) => total + item.quantity, 0)}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</nav>

			<section className="relative pt-32 pb-20 px-4 overflow-hidden">
				<div className="absolute top-20 right-[-50px] w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
				<div
					className="absolute top-40 left-[-50px] w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
					style={{ animationDelay: '2s' }}
				></div>
				<div className="container mx-auto text-center relative z-10 max-w-3xl">
					<span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-pink-600 font-bold text-sm mb-6 animate-slide-up">
						Freshly Baked in Warangal
					</span>
					<h1
						className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight animate-slide-up"
						style={{ animationDelay: '0.1s' }}
					>
						Taste the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">Bliss</span> in Every Bite
					</h1>
					<p className="text-xl text-gray-600 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
						Handcrafted pastries, celebration cakes, and artisan breads.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
						<button
							onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
							className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-pink-600 hover:shadow-2xl transition-all transform hover:-translate-y-1"
						>
							Order Now
						</button>
					</div>
				</div>
			</section>

			<section id="menu" className="py-16 container mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
					<div>
						<h2 className="text-3xl font-bold text-gray-900">Our Menu</h2>
						<p className="text-gray-500 mt-2">Fresh from the oven, just for you.</p>
					</div>
					<div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							<input
								type="text"
								placeholder="Search..."
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-pink-500 transition-all w-full"
							/>
						</div>
						<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
							{CATEGORIES.map((category) => (
								<button
									key={category}
									onClick={() => setActiveCategory(category)}
									className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
										activeCategory === category
											? 'bg-gray-900 text-white shadow-lg scale-105'
											: 'bg-white text-gray-600 hover:bg-gray-100'
									}`}
								>
									{category} {category === 'Favorites' && favorites.size > 0 && `(${favorites.size})`}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{products.length === 0 && searchTerm === ''
						? [1, 2, 3, 4].map((item) => (
								<div key={item} className="animate-pulse bg-gray-200 rounded-2xl h-96 w-full"></div>
							))
						: filteredProducts.map((product, index) => (
								<div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
									<ProductCard
										product={product}
										onAdd={addToCart}
										isFavorite={favorites.has(product.id)}
										onToggleFavorite={toggleFavorite}
									/>
								</div>
							))}
				</div>
				{filteredProducts.length === 0 && products.length > 0 && (
					<div className="text-center py-20">
						<p className="text-2xl text-gray-400 font-bold">No treats found :(</p>
					</div>
				)}
			</section>

			<section className="bg-pink-500 text-white py-20 px-4 mt-10 relative overflow-hidden">
				<FloatingDonut delay={0} left={10} size={40} />
				<FloatingDonut delay={2} left={80} size={60} />
				<div className="container mx-auto text-center relative z-10">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Bliss Family</h2>
					<p className="text-pink-100 mb-8 max-w-xl mx-auto">Get exclusive updates on our daily specials!</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
						<input
							type="email"
							placeholder="Enter your email"
							className="px-6 py-4 rounded-full text-gray-800 focus:outline-none flex-1"
						/>
						<button className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg">
							Subscribe
						</button>
					</div>
				</div>
			</section>

			<footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 text-center text-xs">
				© 2025 Bliss Bakes. All rights reserved.
			</footer>

			<CartSidebar
				isOpen={isCartOpen}
				onClose={() => setIsCartOpen(false)}
				cart={cart}
				updateQuantity={(id, change) =>
					setCart((prev) =>
						prev
							.map((item) =>
								item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item,
							)
							.filter((item) => item.quantity > 0),
					)
				}
				removeItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
				onCheckout={() => setCurrentView('checkout')}
			/>
		</div>
	);
}

