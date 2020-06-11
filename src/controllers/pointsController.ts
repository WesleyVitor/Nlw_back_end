import knex from '../database/connection';
import {Request, Response} from 'express';
class PointsController{
    async index(request:Request, response:Response){
        const {city,uf,items}= request.query;

        const parsetItem = String(items)
            .split(',')
            .map(item=>Number(item.trim()));

        const point = await knex('points')
            .join('point_items','point_id','=','point_items.point_id')
            .whereIn('point_items.items_id',parsetItem)
            .where('city',String(city))
            .where('uf',String(uf))
            .distinct()
            .select('points.*') 
        

        return response.json(point);
    }

    async show(request:Request, response:Response){
        const { id } = request.params;

        const point = await knex('points').where('id',id).first();

        if(!point){
            return response.status(400).json({messsage:"Algo deu errado!!"});
        }

        const items = await knex('items')
            .join('point_items','items.id','=','point_items.items_id')
            .where('point_items.items_id',id)
            .select('items.title');
        return response.json({point,items});
    }
    async create(request:Request, response:Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            logintude,
            city,
            uf,
            items
    
        } = request.body;
    
        const trx = await knex.transaction();
        
        const point = {
            image:'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            logintude,
            city,
            uf,
        }
        const ids = await trx('points').insert(point);
    
    
        const point_id = ids[0];
        const pointItems = items.map((items_id:number)=>{
            return {
                items_id,
                point_id
            };
        })
    
        await trx('point_items').insert(pointItems);

        await trx.commit();
    
    
        return response.json({
            id:point_id,
            ...point,
        });
    
    }
}

export default PointsController;