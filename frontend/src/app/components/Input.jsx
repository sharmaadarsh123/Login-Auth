const Input = ({ label, id, type, value, onChange, error }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-semibold mb-2 capitalize">
        {label}
      </label>

      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
