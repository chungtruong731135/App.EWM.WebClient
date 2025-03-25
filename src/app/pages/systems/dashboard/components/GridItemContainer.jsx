import React, { useEffect, useState } from 'react';

import GridItem from './GridItem';

const GridItemContainer = ({ title, type, data, children, item, ...props }) => {
  return (
    <GridItem title={title} type={type} data={data} root={item} {...props}>
      {children}
    </GridItem>
  );
};

export default GridItemContainer;
