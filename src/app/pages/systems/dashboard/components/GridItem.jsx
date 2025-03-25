import React, { useEffect, useState } from 'react';

const GridItemContainer = ({ title, data, type, className, style, dispatch, root, children, ...rest }) => {
  return (
    <div className={`grid-item ${className}`} style={style} {...rest}>
      <div className="grid-item__title">
        <div>123</div>
      </div>
      <div className="grid-item__graph">
        <>123123</>
      </div>
      {children}
    </div>
  );
};

export default GridItemContainer;
