'use client';

interface CategoryAlertProps {
  category: string;
  spent: number;
  limit: number;
  isExceeded: boolean;
}

export default function CategoryAlert({ category, spent, limit, isExceeded }: CategoryAlertProps) {
  const percentage = (spent / limit) * 100;
  
  return (
    <div className={`rounded-lg p-4 border-l-4 ${
      isExceeded ? 'bg-red-50 border-red-500' : percentage > 80 ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
            isExceeded ? 'bg-red-100' : percentage > 80 ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <i className={`${
              isExceeded ? 'ri-alert-line text-red-600' : 
              percentage > 80 ? 'ri-error-warning-line text-yellow-600' : 'ri-check-line text-green-600'
            } text-sm`}></i>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{category}</h4>
            <p className="text-sm text-gray-600">
              R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isExceeded ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              isExceeded ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 