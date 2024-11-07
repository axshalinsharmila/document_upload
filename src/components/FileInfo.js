const FileInfo = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3">
      <p className="font-bold text-neutral-500 text-[12px]">
          {label} :
      </p>
      <div className="col col-span-2">
          <p className="text-neutral-500 text-[12px] font-medium">{value}</p>
      </div>
  </div>
);
export default FileInfo;