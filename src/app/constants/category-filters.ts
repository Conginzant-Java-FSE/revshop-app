export const CATEGORY_FILTERS: Record<string, { name: string, options: string[] }[]> = {
    'Electronics': [
        { name: 'Brand', options: ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo'] },
        { name: 'Color', options: ['Black', 'Silver', 'White', 'Blue', 'Grey'] },
        { name: 'Warranty', options: ['1 Year', '2 Years', 'No Warranty'] }
    ],
    'Fashion': [
        { name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
        { name: 'Color', options: ['Red', 'Blue', 'Black', 'White', 'Green'] },
        { name: 'Material', options: ['Cotton', 'Polyester', 'Wool', 'Silk'] },
        { name: 'Gender', options: ['Men', 'Women', 'Unisex', 'Kids'] }
    ],
    'Home & Kitchen': [
        { name: 'Material', options: ['Plastic', 'Steel', 'Wood', 'Ceramic'] },
        { name: 'Color', options: ['White', 'Black', 'Steel', 'Brown'] }
    ],
    'Books': [
        { name: 'Format', options: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'] },
        { name: 'Language', options: ['English', 'Spanish', 'French', 'German', 'Hindi'] }
    ],
    'Health & Beauty': [
        { name: 'Skin Type', options: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'] },
        { name: 'Brand', options: ['Loreal', 'Nivea', 'Dove', 'Neutrogena'] }
    ],
    'Sports': [
        { name: 'Sport Type', options: ['Cricket', 'Football', 'Basketball', 'Tennis', 'Gym'] },
        { name: 'Size', options: ['Standard', 'Small', 'Medium', 'Large'] }
    ]
};
