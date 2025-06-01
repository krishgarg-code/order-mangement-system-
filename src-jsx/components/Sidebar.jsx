import { Home, FileText, Plus, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Sidebar = ({
  currentPage,
  onPageChange,
  onImportExcel,
  onExportExcel,
  onDownloadSample,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "All Orders", icon: FileText },
    { id: "add-order", label: "Add Order", icon: Plus },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-orange-400">
          C.S CASTINGS
        </h1>
        <p className="text-sm text-slate-400 mt-1">Order Management System</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    currentPage === item.id
                      ? "bg-orange-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <Button
          onClick={onExportExcel}
          variant="outline"
          size="sm"
          className="w-full justify-start text-slate-300 border-slate-600 hover:bg-slate-800"
        >
          <Download size={16} className="mr-2" />
          Export Excel
        </Button>
        <Button
          onClick={onImportExcel}
          variant="outline"
          size="sm"
          className="w-full justify-start text-slate-300 border-slate-600 hover:bg-slate-800"
        >
          <Upload size={16} className="mr-2" />
          Import Excel
        </Button>
        <Button
          onClick={onDownloadSample}
          variant="outline"
          size="sm"
          className="w-full justify-start text-slate-300 border-slate-600 hover:bg-slate-800"
        >
          <Download size={16} className="mr-2" />
          Sample File
        </Button>
      </div>
    </div>
  );
};
