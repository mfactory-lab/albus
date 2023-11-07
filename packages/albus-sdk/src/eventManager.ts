import type { Idl, IdlEvents } from '@coral-xyz/anchor'
import { EventManager as AnchorEventManager, BorshCoder } from '@coral-xyz/anchor'
import type { AlbusClient } from './client'

const SIMULATION_SIGNATURE = '1111111111111111111111111111111111111111111111111111111111111111'

export class EventManager<IDL extends Idl = Idl> {
  _coder: BorshCoder
  _events: AnchorEventManager

  constructor(readonly client: AlbusClient, idl: IDL) {
    this._coder = new BorshCoder(idl)
    this._events = new AnchorEventManager(client.programId, client.provider, this._coder)
  }

  /**
   * Invokes the given callback every time the given event is emitted.
   *
   * @param eventName The PascalCase name of the event, provided by the IDL.
   * @param callback  The function to invoke whenever the event is emitted from
   *                  program logs.
   */
  public addEventListener<E extends keyof IdlEvents<IDL>>(
    eventName: E,
    callback: (event: IdlEvents<IDL>[E], slot: number, signature: string) => void,
  ): number {
    return this._events.addEventListener(eventName, (event: any, slot: number, signature: string) => {
      if (signature !== SIMULATION_SIGNATURE) {
        callback(event, slot, signature)
      }
    })
  }

  /**
   * Unsubscribes from the given listener.
   * @param listener
   */
  public async removeEventListener(listener: number): Promise<void> {
    return this._events.removeEventListener(listener)
  }
}
