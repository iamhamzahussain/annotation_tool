const documentList = [
    {
        value: '/comicbooks',
        label: 'Comic Books',
        children: [
            {
                value: '/comicbooks/harrypotter/',
                label: 'Harry Potter',
                children: [{
                    value: '/comicbooks/harrypotter/partone',
                    label: 'Harry Potter - I',
                }],
            },
            {
                value: '/comicbooks/nagraj',
                label: 'Nagraj ka Badala',
            },
        ],
    },
    {
        value: '/businessdoc',
        label: 'Business Documents',
    },
    {
        value: '/incomtaxdoc',
        label: 'Incometax Documents',
    }
];
const imageList = [
    {
        value: 'favorite-empires',
        label: 'Favorite Empires',
        children: [
            {
                value: 'classical-era',
                label: 'Classical Era',
                children: [
                    {
                        value: 'persian',
                        label: 'First Persian Empire',
                        imgUri: 'https://img.freepik.com/free-photo/purple-osteospermum-daisy-flower_1373-16.jpg?w=2000',

                    },
                    {
                        value: 'qin',
                        label: 'Qin Dynasty',
                        imgUri:'https://hips.hearstapps.com/hmg-prod/images/close-up-of-tulips-blooming-in-field-royalty-free-image-1584131603.jpg',
                    },
                    {
                        value: 'spqr',
                        label: 'Roman Empire',
                        imgUri:'https://images.pexels.com/photos/1149923/pexels-photo-1149923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',

                    },
                ],
            },
            {
                value: 'medieval-era',
                label: 'Medieval Era',
                children: [
                    {
                        value: 'abbasid',
                        label: 'Abbasid Caliphate',
                    },
                    {
                        value: 'byzantine',
                        label: 'Byzantine Empire',
                    },
                    {
                        value: 'holy-roman',
                        label: 'Holy Roman Empire',
                    },
                    {
                        value: 'ming',
                        label: 'Ming Dynasty',
                    },
                    {
                        value: 'mongol',
                        label: 'Mongol Empire',
                    },
                ],
            },
            {
                value: 'modern-era',
                label: 'Modern Era',
                children: [
                    {
                        value: 'aztec',
                        label: 'Aztec Empire',
                    },
                    {
                        value: 'british',
                        label: 'British Empire',
                    },
                    {
                        value: 'inca',
                        label: 'Inca Empire',
                    },
                    {
                        value: 'qing',
                        label: 'Qing Dynasty',
                    },
                    {
                        value: 'russian',
                        label: 'Russian Empire',
                    },
                    {
                        value: 'spanish',
                        label: 'Spanish Empire',
                    },
                ],
            },
        ],
    },
];
const videoList = [];

export {
    documentList,
    imageList,
    videoList
};