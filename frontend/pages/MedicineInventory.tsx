import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, AlertTriangle, CheckCircle2, Trash2, Package, Edit3 } from 'lucide-react';
import { Button } from '../components/Button';
import { InventoryItem } from '../types';

export const MedicineInventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    stockQuantity: 100,
    unitPrice: 15,
    category: 'Tablets',
    batchNumber: 'BATCH-2026-A',
    expiryDate: '2027-12-31'
  });

  useEffect(() => {
    const saved = localStorage.getItem('mediscript_inventory');
    if (saved) {
      try {
        setInventory(JSON.parse(saved));
      } catch (e) {
        initDefaultInventory();
      }
    } else {
      initDefaultInventory();
    }
  }, []);

  const initDefaultInventory = () => {
    const defaults: InventoryItem[] = [
      { id: 'inv-1', name: 'Paracetamol 500mg', stockQuantity: 250, unitPrice: 5, category: 'Analgesics', batchNumber: 'PCM-9912', expiryDate: '2027-08-30' },
      { id: 'inv-2', name: 'Amoxicillin 500mg', stockQuantity: 15, unitPrice: 25, category: 'Antibiotics', batchNumber: 'AMX-4410', expiryDate: '2026-11-15' },
      { id: 'inv-3', name: 'Cetirizine 10mg', stockQuantity: 180, unitPrice: 8, category: 'Antihistamines', batchNumber: 'CTZ-2019', expiryDate: '2028-01-20' },
      { id: 'inv-4', name: 'Omeprazole 20mg', stockQuantity: 12, unitPrice: 18, category: 'Gastrointestinal', batchNumber: 'OMP-7721', expiryDate: '2026-09-10' },
      { id: 'inv-5', name: 'Pantoprazole 40mg', stockQuantity: 95, unitPrice: 20, category: 'Gastrointestinal', batchNumber: 'PNTP-3312', expiryDate: '2027-05-12' },
      { id: 'inv-6', name: 'Azithromycin 500mg', stockQuantity: 5, unitPrice: 45, category: 'Antibiotics', batchNumber: 'AZT-8812', expiryDate: '2026-10-01' }
    ];
    setInventory(defaults);
    localStorage.setItem('mediscript_inventory', JSON.stringify(defaults));
  };

  const updateInventory = (items: InventoryItem[]) => {
    setInventory(items);
    localStorage.setItem('mediscript_inventory', JSON.stringify(items));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name,
      stockQuantity: Number(newItem.stockQuantity) || 0,
      unitPrice: Number(newItem.unitPrice) || 0,
      category: newItem.category || 'General',
      batchNumber: newItem.batchNumber || 'BATCH-001',
      expiryDate: newItem.expiryDate || '2027-12-31'
    };
    updateInventory([...inventory, item]);
    setShowAddModal(false);
    setNewItem({ name: '', stockQuantity: 100, unitPrice: 15, category: 'Tablets', batchNumber: 'BATCH-2026-A', expiryDate: '2027-12-31' });
  };

  const adjustStock = (id: string, delta: number) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.stockQuantity + delta);
        return { ...item, stockQuantity: newQty };
      }
      return item;
    });
    updateInventory(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this medicine from inventory?')) {
      updateInventory(inventory.filter(i => i.id !== id));
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.stockQuantity < 20).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Pill size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pharmacy Stock & Inventory</h1>
            <p className="text-xs text-slate-500 mt-0.5">Compounder dispensing assistant & medicine stock tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle size={14} /> {lowStockCount} Low Stock Alert
            </span>
          )}
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-1.5" /> Add Medicine Stock
          </Button>
        </div>
      </div>

      {/* Inventory Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search medicine name, category, or batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Total Items: {inventory.length}</span>
        </div>

        {/* Inventory Table */}
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b">
            <tr>
              <th className="p-3.5">Medicine Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Batch / Expiry</th>
              <th className="p-3.5">Unit Price</th>
              <th className="p-3.5">Stock Level</th>
              <th className="p-3.5 text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map(item => {
              const isLowStock = item.stockQuantity < 20;
              const isOutStock = item.stockQuantity === 0;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 text-sm">
                    {item.name}
                  </td>
                  <td className="p-3.5 font-medium text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    <span className="font-mono text-slate-700 font-bold block">{item.batchNumber}</span>
                    <span>Exp: {item.expiryDate}</span>
                  </td>
                  <td className="p-3.5 font-extrabold text-slate-900 text-sm">
                    ₹{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    {isOutStock ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                        Low Stock ({item.stockQuantity})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        In Stock ({item.stockQuantity})
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => adjustStock(item.id, -10)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold"
                      title="Dispensed 10 units"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => adjustStock(item.id, 50)}
                      className="px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg font-bold"
                      title="Re-stock 50 units"
                    >
                      +50
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">Add New Pharmacy Stock</h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Medicine Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ciprofloxacin 500mg"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={newItem.stockQuantity}
                    onChange={e => setNewItem({ ...newItem, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Unit Price (Rs. ₹)</label>
                  <input
                    type="number"
                    value={newItem.unitPrice}
                    onChange={e => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newItem.batchNumber}
                    onChange={e => setNewItem({ ...newItem, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={e => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Stock Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
