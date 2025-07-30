import React from 'react';
import { Item } from '../types/app.types';

interface ItemUseModalProps {
  showUseItemModal: boolean;
  itemToUse: Item | null;
  attributeNames: Record<string, string>;
  onClose: () => void;
  onConfirm: () => void;
}

const ItemUseModal: React.FC<ItemUseModalProps> = ({
  showUseItemModal,
  itemToUse,
  attributeNames,
  onClose,
  onConfirm
}) => {
  if (!showUseItemModal || !itemToUse) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900">使用道具</h3>
          <div className="mt-2">
            <p className="text-gray-500">
              确定要使用道具 <span className="font-medium text-gray-900">{itemToUse.name}</span> 吗？
            </p>
            {itemToUse.effects && itemToUse.effects.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">道具效果:</p>
                <ul className="mt-1 text-sm text-gray-500">
                  {itemToUse.effects.map((effect, index) => (
                    <li key={index}>
                      {attributeNames[effect.attribute] || effect.attribute}: {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                      {effect.type === 'percentage' ? '%' : ' EXP'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-5 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              确认使用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemUseModal;