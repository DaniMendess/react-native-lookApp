import React, {useState, useContext} from 'react';
import { ActivityIndicator } from 'react-native';
import {Box, Text, ScrollView, Title,Spacer} from '../../components/index';
import Header from '../../components/Header';
import Tabs from '../../components/Tabs';
import Product from '../../components/Product';
import { Button } from '../../components/index';
import PaymentForm from '../../components/Forms/payment';
import CongratsModal from '../../components/Modals/congrats';
import {colors} from '../../styles/theme.json';
import {AppContext} from '../../contexts/app';
import Empty from '../../components/Empty';
import util from '../../util';
import api from '../../services/api';
import moment from 'moment';

const Cart = () => {
    const [loading , setLoading] = useState(false);
    const [creditCard, setCreditCard] = useState({});
    const {cart, DISCOUNT_PERCENTE, user, ORDER_NUMBER} = useContext(AppContext);
    const [showCongrats, setShowCongrats] = useState(false);
    const cartIsEmpty = cart?.length === 0;
    const orderPrice = cart?.reduce((acc , product ) => {
        return (acc + product.price);
    },  0);

    const totalDiscount = (orderPrice *  DISCOUNT_PERCENTE).toFixed(2);
    const delivery = 10;
    const valueTotal = orderPrice  + delivery - totalDiscount;
    const [tab, setTab] = useState('cart');

    const buyCart = async () => {
        try {
            setLoading(true);
            //Validar os dados do cartão de credito
            const creditCardValidation = util.isValidCreditCard(creditCard);

            if (creditCardValidation.error){
                alert(creditCardValidation.message);
                return false;
            }

            const {data: orderData} = await api.post('/orders', {
                userId: user.id,
                step: 'waiting',
                createdAt: moment().format(),
                orderNumber: ORDER_NUMBER,
                trackingNumber: new Date().getTime(),
                totalValue: valueTotal,
                totalItems: cart?.length,
            });

            if (!orderData.id){
                alert('Erro ao fazer pedido, tente denovo!');
                setLoading(false);
                return false;
            }

            //Exibir modal de sucesso
            setShowCongrats(true);


        } catch (err){
            alert(err.message);
            setLoading(false);
        }
    };


    return (
       <>
       {showCongrats && <CongratsModal /> }

        <Header title="Cart" goBack/>
        {cartIsEmpty && <Empty messagem="Carrinho vazio!"/>}
        {!cartIsEmpty &&
            <>
            <Tabs  tabs={[
             {
                 label: 'Cart', value: 'cart',
             },
             {
                 label: 'Payment', value: 'payment',
             },

            ]}
            active={tab}
            onChange={(value) => {
                 setTab(value);
            } }
            />

            <ScrollView  hasPadding background="light">
             <Spacer size= "20px"/>
             <Title variant="ultra-small">Order number is {ORDER_NUMBER}</Title>
             <Spacer size= "20px"/>
             {tab === 'cart' &&
             <>
                {cart.map(product => <Product product={product}
                selected
                />)}
                <Spacer />
                <Box row width="100%" height="25px" justify="space-between">
                 <Text>Order:</Text>
                 <Text color="dark">${orderPrice}</Text>
                </Box>
                <Box row width="100%" height="25px" justify="space-between">
                 <Text>Discount:</Text>
                 <Text color="success">$ -{totalDiscount}</Text>
                </Box>
                <Box row width="100%" height="25px" justify="space-between">
                 <Text>Delivery:</Text>
                 <Text color="dark">$10.00</Text>
                </Box>
                <Box row width="100%" height="25px" justify="space-between">
                 <Text color="dark" bold>Total order:</Text>
                 <Text color="dark" bold>${valueTotal}</Text>
                </Box>
                <Spacer size="20px" />
                <Button bottom block onPress={() => {
                 setTab('payment');
                }}>
                  <Text color={'light'}>Place Order</Text>
                 </Button>
             </>

             }
             {tab === 'payment' &&
              <>
                 <Spacer size="30px"/>
                 <Box row width="100%" justify="space-between"
                 style={{borderBottomWidth:0.7, borderColor: `${colors.muted}60`, paddingBottom: 9}}
                 >
                     <Text color="dark"bold>Shipping address</Text>
                     <Text color="danger">Change</Text>
                 </Box>
                 <Spacer />
                 <Text color="dark">Tiana Rosser, 4517 Washington Ave Manchester, Kentucky 39495 United States</Text>
                 <Spacer size="30px" />
                 <Box row width="100%" justify="space-between"
                 style={{borderBottomWidth:0.7, borderColor: `${colors.muted}60`, paddingBottom: 9}}
                 >
                     <Text color="dark"bold>Delivery details</Text>
                     <Text color="danger">Change</Text>
                 </Box>
                 <Spacer />
                 <Text color="dark">Standard Delivery</Text>
                 <Text color="dark">Saturday 27 - Tuesday 30</Text>
                 <Text color="dark">Cost: $10</Text>
                 <Spacer size="40px"/>
                 <PaymentForm onChange={(creditCartData) => {
                     setCreditCard(creditCartData);
                 }} />
                 <Spacer size="30px"/>


                 <Button bottom block onPress={() => {
                 buyCart();
                }}>
                    {!loading &&  <Text color={'light'}>Confirmation</Text>}
                    {loading && <ActivityIndicator />}
                 </Button>
             </>}
            </ScrollView>
            </>
        }

       </>
    );
};

export default Cart;
