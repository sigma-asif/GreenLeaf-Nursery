import { useEffect, useState } from 'react';
import { Package, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Updated Order type to support multiple items
interface OrderItem {
  plant_id: string;
  plant_name: string;
  plant_price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Delivered';
  created_at: string;
  updated_at?: string;
}

interface OrderManagementProps {
  onNavigate: (page: string) => void;
}

export default function OrderManagement({ onNavigate }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Group orders by customer and order details to combine multiple items
      const groupedOrders = groupOrdersByCustomer(ordersData || []);
      setOrders(groupedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group orders that have the same customer details and were created around the same time
  const groupOrdersByCustomer = (ordersData: any[]): Order[] => {
    const groupedMap = new Map<string, Order>();

    ordersData.forEach((order) => {
      // Create a unique key based on customer info and time (within 1 minute)
      const orderTime = new Date(order.created_at).getTime();
      const timeWindow = Math.floor(orderTime / 60000); // 1-minute window
      const key = `${order.customer_email}-${order.customer_name}-${timeWindow}`;

      if (groupedMap.has(key)) {
        // Add item to existing order
        const existingOrder = groupedMap.get(key)!;
        existingOrder.items.push({
          plant_id: order.plant_id,
          plant_name: order.plant_name,
          plant_price: order.plant_price,
          quantity: order.quantity,
          subtotal: order.plant_price * order.quantity
        });
        existingOrder.total_amount += order.total_amount;
      } else {
        // Create new grouped order
        groupedMap.set(key, {
          id: order.id,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          shipping_address: order.shipping_address,
          items: [{
            plant_id: order.plant_id,
            plant_name: order.plant_name,
            plant_price: order.plant_price,
            quantity: order.quantity,
            subtotal: order.plant_price * order.quantity
          }],
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at
        });
      }
    });

    return Array.from(groupedMap.values());
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'Pending' | 'Confirmed' | 'Delivered') => {
    try {
      // Update all orders that belong to this grouped order
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      // If this is a grouped order, update all related orders
      if (selectedOrder && selectedOrder.items.length > 1) {
        // Find all order IDs that match the customer and time
        const { data: relatedOrders, error: fetchError } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_email', selectedOrder.customer_email)
          .eq('customer_name', selectedOrder.customer_name)
          .gte('created_at', new Date(new Date(selectedOrder.created_at).getTime() - 60000).toISOString())
          .lte('created_at', new Date(new Date(selectedOrder.created_at).getTime() + 60000).toISOString());

        if (!fetchError && relatedOrders) {
          for (const relatedOrder of relatedOrders) {
            await supabase
              .from('orders')
              .update({ status: newStatus, updated_at: new Date().toISOString() })
              .eq('id', relatedOrder.id);
          }
        }
      }

      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? All items in this order will be deleted.')) return;

    try {
      // Delete all orders that belong to this grouped order
      if (selectedOrder && selectedOrder.items.length > 1) {
        const { data: relatedOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_email', selectedOrder.customer_email)
          .eq('customer_name', selectedOrder.customer_name)
          .gte('created_at', new Date(new Date(selectedOrder.created_at).getTime() - 60000).toISOString())
          .lte('created_at', new Date(new Date(selectedOrder.created_at).getTime() + 60000).toISOString());

        if (relatedOrders) {
          for (const relatedOrder of relatedOrders) {
            await supabase.from('orders').delete().eq('id', relatedOrder.id);
          }
        }
      } else {
        await supabase.from('orders').delete().eq('id', orderId);
      }

      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <div className="flex space-x-2">
          {['All', 'Pending', 'Confirmed', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-6 hover:bg-gray-50 transition cursor-pointer ${
                      selectedOrder?.id === order.id ? 'bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{order.customer_name}</h3>
                        <p className="text-gray-600 text-sm">{order.customer_email}</p>
                        <p className="text-gray-600 text-sm">{order.customer_phone}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-3 space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{item.plant_name}</p>
                            <p className="text-sm text-gray-600">
                              ${item.plant_price} × {item.quantity} = ${item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between items-center">
                        <p className="font-semibold text-gray-700">Total:</p>
                        <p className="font-bold text-green-600 text-lg">${order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Order Date: {new Date(order.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <p className="text-gray-900">{selectedOrder.customer_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedOrder.customer_email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedOrder.customer_phone}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                  <p className="text-gray-900 whitespace-pre-line">{selectedOrder.shipping_address}</p>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-900 font-medium">{item.plant_name}</p>
                        <p className="text-gray-600 text-sm">Price: ${item.plant_price}</p>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        <p className="text-green-600 font-semibold">Subtotal: ${item.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-green-600 mt-3">
                    Total: ${selectedOrder.total_amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <p className="text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Pending')}
                    disabled={selectedOrder.status === 'Pending'}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Mark as Pending
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Confirmed')}
                    disabled={selectedOrder.status === 'Confirmed'}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Mark as Confirmed
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Delivered')}
                    disabled={selectedOrder.status === 'Delivered'}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Mark as Delivered
                  </button>
                </div>

                <button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mt-4"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Order</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-center">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}