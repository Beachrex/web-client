interface IconProps {
  isActive: boolean;
}

// SVG icon for single column layout
export const SingleColumnIcon = ({ isActive }: IconProps) => (
  <svg
    width='10'
    height='22'
    viewBox='0 0 13 30'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect
      width='13'
      height='13'
      rx='2'
      fill={isActive ? '#4D4D4D' : '#E7E7E7'}
    />
    <rect
      y='17'
      width='13'
      height='13'
      rx='2'
      fill={isActive ? '#4D4D4D' : '#E7E7E7'}
    />
  </svg>
);

// SVG icon for double column layout
export const DoubleColumnIcon = ({ isActive }: IconProps) => (
  <svg
    width='22'
    height='22'
    viewBox='0 0 30 30'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect
      width='13'
      height='13'
      rx='2'
      fill={isActive ? '#4D4D4D' : '#E7E7E7'}
    />
    <rect
      y='17'
      width='13'
      height='13'
      rx='2'
      fill={isActive ? '#4D4D4D' : '#E7E7E7'}
    />
    <rect
      x='17'
      width='13'
      height='13'
      rx='2'
      fill={isActive ? '#4D4D4D' : '#E7E7E7'}
    />
    <rect
      x='17'
      y='17'
      width='13'
      height='13'
      rx='2'
      fill={isActive ? '#4D4D4D' : '#E7E7E7'}
    />
  </svg>
);

// SVG icon for radius/distance indicator
export const RadiusIcon = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 20 20'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g clipPath='url(#clip0_991_26195)'>
      <path
        d='M18.6118 4.62094C19.1807 3.72254 19.0821 2.5093 18.2864 1.71359C17.4914 0.918516 16.2783 0.818789 15.3791 1.38816C13.8704 0.466836 12.0643 0 10 0C4.39254 0 0 4.39254 0 10C0 15.6075 4.39254 20 10 20C15.6075 20 20 15.6075 20 10C20 7.9357 19.5332 6.12961 18.6118 4.62094ZM17.1816 2.81844C17.4869 3.12379 17.4869 3.61793 17.1816 3.92328C16.8762 4.22859 16.3821 4.22863 16.0767 3.92328C15.7714 3.61793 15.7714 3.12379 16.0767 2.81844C16.382 2.51312 16.8762 2.51309 17.1816 2.81844ZM10 18.4375C5.26867 18.4375 1.5625 14.7313 1.5625 10C1.5625 5.26871 5.26867 1.5625 10 1.5625C11.6968 1.5625 13.1752 1.92066 14.4058 2.62777C14.2148 3.20098 14.2511 3.83363 14.5135 4.38172L11.0099 7.88531C10.7039 7.73859 10.3614 7.65625 10 7.65625C8.70766 7.65625 7.65625 8.70766 7.65625 10C7.65625 11.2923 8.70766 12.3438 10 12.3438C11.2923 12.3438 12.3438 11.2923 12.3438 10C12.3438 9.63859 12.2614 9.29613 12.1147 8.99016L15.6183 5.48656C16.1654 5.74848 16.798 5.78555 17.3722 5.59426C18.0793 6.82484 18.4375 8.30316 18.4375 10C18.4375 14.7313 14.7313 18.4375 10 18.4375ZM10.7812 10C10.7812 10.4308 10.4308 10.7812 10 10.7812C9.56922 10.7812 9.21875 10.4308 9.21875 10C9.21875 9.56922 9.56922 9.21875 10 9.21875C10.4308 9.21875 10.7812 9.56922 10.7812 10Z'
        fill='#8D8D8D'
      />
    </g>
    <defs>
      <clipPath id='clip0_991_26195'>
        <rect width='20' height='20' fill='white' />
      </clipPath>
    </defs>
  </svg>
);

